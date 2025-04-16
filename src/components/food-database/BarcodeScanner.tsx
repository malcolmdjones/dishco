
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X, Camera, Barcode, Plus, Minus, ArrowRight } from 'lucide-react';
import { FoodDatabaseItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Quagga from 'quagga';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (food: FoodDatabaseItem) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onFoodFound }) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [foundFood, setFoundFood] = useState<FoodDatabaseItem | null>(null);
  const [servingQuantity, setServingQuantity] = useState(1);
  const [servingUnit, setServingUnit] = useState('serving');
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const scannerRef = useRef<HTMLDivElement>(null);
  const scanActive = useRef<boolean>(false);
  const lastScannedCode = useRef<string | null>(null);
  const validationBuffer = useRef<{code: string, timestamp: number}[]>([]);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
  // Handle dialog open/close
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setManualBarcode('');
      setCameraError(null);
      setShowConfirmation(false);
      setFoundFood(null);
    } else if (isOpen && !showManualInput && !showConfirmation) {
      const timer = setTimeout(() => {
        startScanner();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Handle mode changes
  useEffect(() => {
    if (isOpen) {
      if (showManualInput || showConfirmation) {
        stopScanner();
      } else {
        startScanner();
      }
    }
  }, [showManualInput, isOpen, showConfirmation]);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    stopScanner();
    
    setCameraError(null);
    scanActive.current = true;
    lastScannedCode.current = null;
    validationBuffer.current = [];
    
    try {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment",
            width: { min: 320, ideal: isMobile ? 640 : 1280, max: 1920 },
            height: { min: 240, ideal: isMobile ? 480 : 720, max: 1080 },
            aspectRatio: { min: 1, max: 2 }
          },
          area: { // Define scan area based on device type
            top: isMobile ? "30%" : "20%",    
            right: isMobile ? "10%" : "20%",  
            left: isMobile ? "10%" : "20%",   
            bottom: isMobile ? "50%" : "60%"  
          },
        },
        locator: {
          patchSize: isMobile ? "medium" : "large",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency ? 
          Math.max(2, Math.min(navigator.hardwareConcurrency - 1, 4)) : 
          2,
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader"
          ],
          debug: {
            showCanvas: false,
            showPatches: false,
            showFoundPatches: false,
            showSkeleton: false,
            showLabels: false,
            showPatchLabels: false,
            showRemainingPatchLabels: false
          }
        },
        locate: true
      }, function(err) {
        if (err) {
          console.error("Error starting Quagga:", err);
          setCameraError("Couldn't access your camera. Please check permissions or use manual entry.");
          setShowManualInput(true);
          return;
        }
        
        console.log("Quagga started successfully");
        
        Quagga.start();
      });
      
      // Handle successful scans
      Quagga.onDetected((result) => {
        if (!scanActive.current) return;
        
        const code = result.codeResult.code;
        if (!code || !/^\d{8,13}$/.test(code)) {
          return;
        }
        
        console.log(`Detected barcode: ${code} with format: ${result.codeResult.format}`);
        
        // Add to validation buffer with confidence
        validationBuffer.current.push({
          code,
          timestamp: Date.now()
        });
        
        // Filter old entries (older than 3 seconds)
        const now = Date.now();
        validationBuffer.current = validationBuffer.current.filter(item => 
          now - item.timestamp < 3000
        );
        
        // Count occurrences of this code in the buffer
        const occurrences = validationBuffer.current.filter(item => item.code === code).length;
        
        // Process if we have multiple detections of the same code
        if (occurrences >= 2 && code !== lastScannedCode.current) {
          lastScannedCode.current = code;
          scanActive.current = false;
          
          stopScanner();
          processBarcode(code);
        }
      });
      
    } catch (err) {
      console.error("Error initializing scanner:", err);
      setCameraError("Couldn't access your camera. Please check permissions or use manual entry.");
      setShowManualInput(true);
    }
  };

  const stopScanner = () => {
    try {
      Quagga.stop();
      scanActive.current = false;
    } catch (e) {
      console.info("Exception stopping scanner:", e);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    
    await processBarcode(manualBarcode);
  };
  
  const processBarcode = async (code: string) => {
    setIsSearching(true);
    
    toast({
      title: "Scanning Barcode",
      description: `Looking up: ${code}`,
    });
    
    console.log(`Processing barcode: ${code}`);
    
    try {
      const food = await scanBarcode(code);
      setIsSearching(false);
      
      if (food) {
        toast({
          title: "Product Found",
          description: `${food.name} identified successfully.`,
        });
        
        // Instead of immediately calling onFoodFound, show the confirmation screen
        setFoundFood(food);
        setShowConfirmation(true);
        
        // Reset serving information
        setServingQuantity(1);
        if (food.servingUnit) {
          setServingUnit(food.servingUnit);
        } else {
          setServingUnit('serving');
        }
      } else {
        console.log(`No product found for barcode: ${code}`);
        toast({
          title: "Product Not Found",
          description: "This product isn't in our database. Try another or enter details manually.",
          variant: "destructive"
        });
        
        if (!showManualInput) {
          setTimeout(() => {
            if (isOpen) {
              scanActive.current = true;
              startScanner();
            }
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
      toast({
        title: "Scan Error",
        description: "There was an error scanning the barcode. Please try again or enter manually.",
        variant: "destructive"
      });
      setIsSearching(false);
      
      if (!showManualInput) {
        setTimeout(() => {
          if (isOpen) {
            scanActive.current = true;
            startScanner();
          }
        }, 1500);
      }
    }
  };
  
  const retryCamera = () => {
    setCameraError(null);
    setShowManualInput(false);
    setTimeout(() => startScanner(), 500);
  };
  
  const handleQuantityChange = (value: string) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity > 0) {
      setServingQuantity(quantity);
    }
  };
  
  const incrementQuantity = () => {
    setServingQuantity(prev => Math.min(prev + 0.5, 100));
  };
  
  const decrementQuantity = () => {
    setServingQuantity(prev => Math.max(prev - 0.5, 0.5));
  };
  
  const calculateAdjustedNutrition = () => {
    if (!foundFood) return null;
    
    return {
      calories: Math.round(foundFood.macros.calories * servingQuantity),
      protein: Math.round(foundFood.macros.protein * servingQuantity * 10) / 10,
      carbs: Math.round(foundFood.macros.carbs * servingQuantity * 10) / 10,
      fat: Math.round(foundFood.macros.fat * servingQuantity * 10) / 10
    };
  };
  
  const handleAddToLog = () => {
    if (!foundFood) return;
    
    // Create an adjusted copy of the food item with updated macros
    const adjustedFood: FoodDatabaseItem = {
      ...foundFood,
      servingSize: `${servingQuantity}`,
      servingUnit: servingUnit,
      macros: calculateAdjustedNutrition() || foundFood.macros
    };
    
    // Pass the adjusted food to the parent component
    onFoodFound(adjustedFood);
    onClose();
  };
  
  const getServingUnitOptions = () => {
    // Start with common serving units
    const options = ['serving', 'g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece'];
    
    // Add original serving unit if it exists and isn't already in the list
    if (foundFood?.servingUnit && !options.includes(foundFood.servingUnit)) {
      options.unshift(foundFood.servingUnit);
    }
    
    return options;
  };
  
  const renderConfirmationScreen = () => {
    if (!foundFood) return null;
    
    const adjustedNutrition = calculateAdjustedNutrition();
    const servingUnitOptions = getServingUnitOptions();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          {foundFood.imageSrc ? (
            <img 
              src={foundFood.imageSrc} 
              alt={foundFood.name}
              className="h-20 w-20 object-contain rounded-md"
            />
          ) : (
            <div className="h-20 w-20 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-medium text-lg">{foundFood.name}</h3>
            {foundFood.brand && (
              <p className="text-sm text-gray-500">{foundFood.brand}</p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Nutrition</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="font-semibold text-blue-600">{adjustedNutrition?.calories}</p>
              <p className="text-xs">Calories</p>
            </div>
            <div>
              <p className="font-semibold">{adjustedNutrition?.protein}g</p>
              <p className="text-xs">Protein</p>
            </div>
            <div>
              <p className="font-semibold">{adjustedNutrition?.carbs}g</p>
              <p className="text-xs">Carbs</p>
            </div>
            <div>
              <p className="font-semibold">{adjustedNutrition?.fat}g</p>
              <p className="text-xs">Fat</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="quantity" className="mb-2 block">Quantity</Label>
            <div className="flex items-center">
              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={servingQuantity <= 0.5}
                className="h-10 w-10 rounded-r-none"
              >
                <Minus size={16} />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="0.1"
                step="0.1"
                value={servingQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="rounded-none text-center w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                className="h-10 w-10 rounded-l-none"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="unit" className="mb-2 block">Unit</Label>
            <Select value={servingUnit} onValueChange={setServingUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {servingUnitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mt-6">
          <Button 
            onClick={handleAddToLog}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Add to Log
            <ArrowRight size={16} className="ml-2" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setShowConfirmation(false);
              setFoundFood(null);
              if (!showManualInput) {
                startScanner();
              }
            }}
            className="w-full"
          >
            Scan Another Product
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 rounded-xl mx-auto" style={{
        width: isMobile ? '95vw' : '500px',
        maxWidth: isMobile ? '95vw' : '500px'
      }}>
        <DialogHeader className="px-4 py-3 border-b relative">
          <Button
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
          <DialogTitle className="text-xl text-blue-600 text-center">
            {showConfirmation 
              ? "Confirm Product" 
              : showManualInput 
                ? "Enter Barcode" 
                : "Scan Barcode"}
          </DialogTitle>
          <DialogDescription className="sr-only">Scan or manually enter a product barcode</DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          {showConfirmation ? (
            renderConfirmationScreen()
          ) : !showManualInput ? (
            <>
              {cameraError ? (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-4">{cameraError}</p>
                  <Button onClick={retryCamera}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div 
                    ref={scannerRef}
                    className="w-full bg-black rounded-lg overflow-hidden relative"
                    style={{
                      height: isMobile ? '45vh' : '55vh',
                      maxHeight: isMobile ? '350px' : '500px',
                      minHeight: '250px'
                    }}
                  >
                    {/* Quagga will insert the video here */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="border-2 border-blue-500 rounded-md"
                        style={{
                          width: '70%',
                          height: '60px',
                          position: 'relative',
                          top: isMobile ? '-15%' : '-10%'
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-center mt-4 text-sm text-gray-600">
                    Center the barcode within the blue frame and hold steady
                  </p>
                </div>
              )}
              
              <div className="flex flex-col space-y-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowManualInput(true)}
                  className="w-full"
                >
                  Enter barcode manually
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter barcode number"
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                  />
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 rounded-l-none"
                    disabled={isSearching || !manualBarcode.trim()}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : 'Search'}
                  </Button>
                </div>
              </form>
              
              {!cameraError && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowManualInput(false)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use camera instead
                </Button>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Common barcode formats: EAN-13, UPC-A, UPC-E
                </p>
              </div>
            </div>
          )}
          
          {isSearching && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <p>Searching for product...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
