
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Barcode, Camera, Loader2, ArrowRight, Zap, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FoodDatabaseItem, NutritionLabelData } from '@/types/food';
import { cn } from '@/lib/utils';
import Quagga from 'quagga';
import { scanBarcode } from '@/services/foodDatabaseService';
import { v4 as uuidv4 } from 'uuid';

const LogMealScanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("barcode");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFood, setScannedFood] = useState<FoodDatabaseItem | null>(null);
  const [scannedNutrition, setScannedNutrition] = useState<NutritionLabelData | null>(null);
  
  const scannerRef = useRef<HTMLDivElement>(null);
  const scanActive = useRef<boolean>(false);
  const lastScannedCode = useRef<string | null>(null);
  const validationBuffer = useRef<{code: string, timestamp: number}[]>([]);
  
  const handleGoBack = () => {
    navigate('/log-meal');
  };

  const continueToDetails = () => {
    if (activeTab === 'barcode' && scannedFood) {
      navigate('/log-meal/search', { 
        state: { selectedFood: scannedFood }
      });
    } else if (activeTab === 'label' && scannedNutrition) {
      navigate('/log-meal/custom-food', {
        state: { nutritionData: scannedNutrition }
      });
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
  useEffect(() => {
    if (isScanning && !scannedFood && !scannedNutrition) {
      const timer = setTimeout(() => {
        startScanner();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [isScanning, activeTab, scannedFood, scannedNutrition]);

  const toggleFlash = async () => {
    try {
      const track = Quagga.CameraAccess.getActiveTrack();
      if (track && track.getCapabilities().torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn }]
        });
        setFlashOn(!flashOn);
        
        toast({
          title: flashOn ? "Flash turned off" : "Flash turned on",
          duration: 1500,
        });
      } else {
        toast({
          title: "Flash not supported",
          description: "Your device doesn't support flash control",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error toggling flash:", error);
      toast({
        title: "Couldn't toggle flash",
        description: "There was an error controlling the camera flash",
        variant: "destructive"
      });
    }
  };
  
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
            width: { min: 320, ideal: 1280, max: 1920 },
            height: { min: 240, ideal: 720, max: 1080 },
            aspectRatio: { min: 1, max: 2 },
            facingMode: "environment",
            // This is to prevent zooming
            zoom: 1.0
          },
          area: { 
            top: "30%",    
            right: "10%",  
            left: "10%",   
            bottom: "50%"  
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency ? 
          Math.max(2, Math.min(navigator.hardwareConcurrency - 1, 4)) : 
          2,
        decoder: {
          readers: activeTab === 'barcode' ? 
            ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"] :
            ["code_128_reader"],
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
          setCameraError("Couldn't access your camera. Please check permissions.");
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
        
        console.log(`Detected barcode: ${code}`);
        
        // Add to validation buffer with timestamp
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
      setCameraError("Couldn't access your camera. Please check permissions.");
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

  const processBarcode = async (code: string) => {
    setLoading(true);
    
    toast({
      title: "Scanning Barcode",
      description: `Looking up: ${code}`,
    });
    
    console.log(`Processing barcode: ${code}`);
    
    try {
      const food = await scanBarcode(code);
      setLoading(false);
      
      if (food) {
        toast({
          title: "Product Found",
          description: `${food.name} identified successfully.`,
        });
        
        setScannedFood(food);
        setIsScanning(false);
      } else {
        console.log(`No product found for barcode: ${code}`);
        toast({
          title: "Product Not Found",
          description: "This product isn't in our database. Try another or enter details manually.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          setIsScanning(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
      toast({
        title: "Scan Error",
        description: "There was an error scanning the barcode. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
      
      setTimeout(() => {
        setIsScanning(true);
      }, 1500);
    }
  };
  
  const handleLabelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    // For now we'll simulate processing for 2 seconds
    // In a real app you'd send the image to an API for processing
    setTimeout(() => {
      // Mock nutrition data from the image (in a real app this would come from API)
      const mockNutritionData: NutritionLabelData = {
        calories: 200,
        protein: 7,
        carbs: 42,
        fat: 1,
        fiber: 2,
        sugar: 2,
        sodium: 0,
        servingSize: "2/3 cup (56g)"
      };
      
      setScannedNutrition(mockNutritionData);
      setLoading(false);
      setIsScanning(false);
      
      toast({
        title: "Label Processed",
        description: "Nutrition information extracted successfully."
      });
    }, 2000);
  };
  
  const rescanItem = () => {
    setScannedFood(null);
    setScannedNutrition(null);
    setIsScanning(true);
    if (activeTab === 'barcode') {
      // For barcode, we can immediately restart scanning
      startScanner();
    }
  };
  
  const switchTab = (tab: string) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    setScannedFood(null);
    setScannedNutrition(null);
    setIsScanning(true);
    // When switching tabs, we'll restart the appropriate scanner
  };
  
  const renderNutritionData = () => {
    const nutritionData = activeTab === 'barcode' ? 
      (scannedFood?.macros || null) : 
      scannedNutrition;
    
    if (!nutritionData) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-5 bg-white rounded-t-3xl shadow-lg mt-4"
      >
        <h3 className="text-xl font-semibold mb-1">
          {activeTab === 'barcode' && scannedFood ? scannedFood.name : 'Scanned Nutrition Label'}
        </h3>
        
        {activeTab === 'barcode' && scannedFood?.brand && (
          <p className="text-gray-500 mb-4">{scannedFood.brand}</p>
        )}
        
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Serving Size:</span>
              <span className="text-lg">
                {activeTab === 'barcode' 
                  ? (scannedFood?.servingSize || "1 serving") 
                  : scannedNutrition?.servingSize || "1 serving"}
              </span>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">Calories</span>
              <span className="text-2xl font-bold">
                {nutritionData.calories} kcal
              </span>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Fat</span>
              <span className="text-lg">
                {activeTab === 'barcode' 
                  ? nutritionData.fat 
                  : nutritionData.fat || 0} g
              </span>
            </div>
            
            {nutritionData.saturatedFat !== undefined && (
              <div className="flex justify-between items-center pl-6 mt-2 text-gray-600">
                <span>Saturated Fat</span>
                <span>{nutritionData.saturatedFat} g</span>
              </div>
            )}
            
            {nutritionData.transFat !== undefined && (
              <div className="flex justify-between items-center pl-6 mt-2 text-gray-600">
                <span>Trans Fat</span>
                <span>{nutritionData.transFat} g</span>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Carbohydrate</span>
              <span className="text-lg">
                {activeTab === 'barcode' 
                  ? nutritionData.carbs 
                  : nutritionData.carbs || 0} g
              </span>
            </div>
            
            {nutritionData.fiber !== undefined && (
              <div className="flex justify-between items-center pl-6 mt-2 text-gray-600">
                <span>Dietary Fiber</span>
                <span>{nutritionData.fiber} g</span>
              </div>
            )}
            
            {nutritionData.sugar !== undefined && (
              <div className="flex justify-between items-center pl-6 mt-2 text-gray-600">
                <span>Total Sugars</span>
                <span>{nutritionData.sugar} g</span>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Protein</span>
              <span className="text-lg">
                {activeTab === 'barcode' 
                  ? nutritionData.protein 
                  : nutritionData.protein || 0} g
              </span>
            </div>
          </div>
          
          {nutritionData.sodium !== undefined && (
            <div className="border-b border-gray-200 pb-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Sodium</span>
                <span className="text-lg">{nutritionData.sodium} mg</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={rescanItem}
            variant="outline"
            className="mr-2"
          >
            Rescan
          </Button>
          <Button 
            onClick={continueToDetails}
            className="bg-black hover:bg-gray-800 text-white rounded-full px-5 py-2"
          >
            Done <ArrowRight size={18} className="ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <div className="bg-black text-white">
        <div className="flex items-center justify-between p-3 relative">
          <button 
            className="p-2 text-white"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <Tabs 
            value={activeTab} 
            onValueChange={switchTab}
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <TabsList className="bg-gray-700 rounded-full p-1">
              <TabsTrigger 
                value="barcode" 
                className={cn(
                  "rounded-full px-4 py-1 text-sm data-[state=active]:bg-white data-[state=active]:text-black",
                  "data-[state=inactive]:text-white transition-all duration-200"
                )}
              >
                Barcode
              </TabsTrigger>
              <TabsTrigger 
                value="label" 
                className={cn(
                  "rounded-full px-4 py-1 text-sm data-[state=active]:bg-white data-[state=active]:text-black",
                  "data-[state=inactive]:text-white transition-all duration-200"
                )}
              >
                Label
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <button 
            className={cn(
              "p-2",
              flashOn ? "text-yellow-300" : "text-white"
            )}
            onClick={toggleFlash}
            aria-label={flashOn ? "Turn flash off" : "Turn flash on"}
          >
            {flashOn ? <Zap size={20} /> : <ZapOff size={20} />}
          </button>
        </div>
        
        <div className="relative">
          <div 
            ref={scannerRef}
            className="w-full bg-black relative"
            style={{
              height: '50vh',
              maxHeight: '500px',
              minHeight: '250px'
            }}
          >
            {/* Quagga will insert the video here */}
            {activeTab === 'barcode' && isScanning && !loading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="border-2 border-white rounded-md"
                  style={{
                    width: '70%',
                    height: '60px',
                    position: 'relative',
                    top: '-10%'
                  }}
                ></div>
              </div>
            )}
            
            {activeTab === 'label' && isScanning && !scannedNutrition && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Camera size={48} className="text-white opacity-70 mb-3" />
                <p className="text-white text-center px-8">
                  Position the nutrition facts label within the frame
                </p>
                
                <Button
                  className="mt-5 bg-white text-black hover:bg-gray-200"
                  onClick={() => {
                    const input = document.getElementById('nutrition-label-input');
                    if (input) input.click();
                  }}
                >
                  Take Photo
                </Button>
                <input
                  id="nutrition-label-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleLabelUpload}
                />
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="text-white mt-4">
                  {activeTab === 'barcode' ? 'Looking up product...' : 'Processing label...'}
                </p>
              </div>
            )}
            
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90">
                <p className="text-white text-center px-8 mb-4">{cameraError}</p>
                <Button
                  variant="outline" 
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={() => {
                    setCameraError(null);
                    startScanner();
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {(scannedFood || scannedNutrition) ? (
          renderNutritionData()
        ) : (
          <motion.div 
            key="scanning-instructions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4"
          >
            <p className="text-center text-gray-600 mb-6">
              {activeTab === 'barcode' ? 
                'Position the barcode within the frame and hold steady' : 
                'Take a clear photo of the nutrition facts label'}
            </p>
            
            {activeTab === 'barcode' ? (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Can't scan the barcode?
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/log-meal/search')}
                >
                  Search for the food instead
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-center">Tips for best results:</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 mb-4">
                  <li>Make sure the entire label is visible in the frame</li>
                  <li>Ensure good lighting to avoid shadows</li>
                  <li>Hold the camera steady for a clear image</li>
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogMealScanPage;
