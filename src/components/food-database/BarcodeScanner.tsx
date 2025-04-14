
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X, Camera, Barcode } from 'lucide-react';
import { FoodDatabaseItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const scannerRef = useRef<HTMLDivElement>(null);
  const scanActive = useRef<boolean>(false);
  const lastScannedCode = useRef<string | null>(null);
  const validationBuffer = useRef<{code: string, timestamp: number}[]>([]);
  
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setManualBarcode('');
      setCameraError(null);
    } else if (isOpen && !showManualInput) {
      const timer = setTimeout(() => {
        startScanner();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      if (showManualInput) {
        stopScanner();
      } else {
        startScanner();
      }
    }
  }, [showManualInput, isOpen]);

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
          area: { // Define scan area for mobile
            top: "0%",    
            right: "0%",  
            left: "0%",   
            bottom: "0%"  
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
        onFoodFound(food);
        onClose();
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
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'max-w-md'} p-0 rounded-xl mx-auto`}>
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
            {showManualInput ? "Enter Barcode" : "Scan Barcode"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          {!showManualInput ? (
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
                    className="w-full h-[60vh] max-h-[400px] bg-black rounded-lg overflow-hidden relative"
                    style={{ aspectRatio: isMobile ? '3/4' : '4/3' }}
                  >
                    {/* Quagga will insert the video here */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-16 border-2 border-blue-500 rounded-md"></div>
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
