
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X, Camera, Barcode } from 'lucide-react';
import { FoodDatabaseItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';
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
  const scannerRef = useRef<HTMLDivElement>(null);
  const quaggaInitialized = useRef<boolean>(false);
  
  // Clean up when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (quaggaInitialized.current) {
        try {
          Quagga.stop();
          quaggaInitialized.current = false;
        } catch (e) {
          console.info("Error stopping scanner:", e);
        }
      }
    };
  }, []);
  
  // Manage scanner state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setManualBarcode('');
      setCameraError(null);
    } else if (isOpen && !showManualInput) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Handle switching between camera and manual input
  useEffect(() => {
    if (isOpen) {
      if (showManualInput) {
        stopScanner();
      } else {
        startScanner();
      }
    }
  }, [showManualInput, isOpen]);

  const startScanner = () => {
    if (!scannerRef.current) return;
    
    // Make sure scanner is stopped before starting again
    stopScanner();
    
    setCameraError(null);
    
    // Configure Quagga with simple settings
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment" // Use back camera
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      decoder: {
        readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"]
      },
      locate: true
    }, function(err) {
      if (err) {
        console.error("Error initializing Quagga:", err);
        setCameraError("Couldn't access your camera. Please check permissions or use manual entry.");
        setShowManualInput(true);
        return;
      }
      
      console.log("Scanner started successfully");
      quaggaInitialized.current = true;
      Quagga.start();
    });
    
    // Set up detection handler
    Quagga.onDetected((result) => {
      if (!result || !result.codeResult || !result.codeResult.code) return;
      
      const code = result.codeResult.code;
      console.log(`Barcode detected: ${code}`);
      
      // Stop scanner and process the code
      stopScanner();
      processBarcode(code);
    });
  };

  const stopScanner = () => {
    try {
      if (quaggaInitialized.current) {
        console.log("Stopping scanner");
        Quagga.offDetected();
        Quagga.stop();
        quaggaInitialized.current = false;
      }
    } catch (e) {
      console.info("Exception stopping scanner:", e);
      // Ignore errors when stopping if Quagga wasn't started
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
          // Restart scanner after a delay
          setTimeout(() => {
            if (isOpen) startScanner();
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
        // Restart scanner after a delay
        setTimeout(() => {
          if (isOpen) startScanner();
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
      <DialogContent className="max-w-md w-[95vw] sm:max-w-lg p-0 rounded-xl">
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
                    className="w-full aspect-[4/3] bg-black relative rounded-lg overflow-hidden"
                  >
                    {/* Quagga will inject the video element here */}
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-16 border-2 border-blue-500 rounded-md"></div>
                    </div>
                  </div>
                  
                  <p className="text-center mt-4 text-sm text-gray-600">
                    Center the barcode within the blue frame
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
      
      <style>{`
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        canvas.drawingBuffer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </Dialog>
  );
};

export default BarcodeScanner;
