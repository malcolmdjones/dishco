
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X, Camera } from 'lucide-react';
import { FoodDatabaseItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (food: FoodDatabaseItem) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onFoodFound }) => {
  const [scanningActive, setScanningActive] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [lastDetectedCode, setLastDetectedCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
  useEffect(() => {
    if (!isOpen) {
      setManualBarcode('');
      setLastDetectedCode(null);
      setCameraError(null);
      stopScanner();
    } else if (isOpen && !showManualInput) {
      initializeCamera();
    }
    
    return () => {
      stopScanner();
    };
  }, [isOpen, showManualInput]);
  
  const initializeCamera = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log("Available cameras:", devices);
      
      if (devices && devices.length > 0) {
        // Select the first available camera and start scanning
        const cameraId = devices[0].id;
        setTimeout(() => startScanner(cameraId), 500);
      } else {
        setCameraError("No cameras found on this device");
        setShowManualInput(true);
      }
    } catch (err) {
      console.error("Error listing cameras:", err);
      setCameraError("Failed to access camera. Please check permissions.");
      setShowManualInput(true);
    }
  };

  const startScanner = async (cameraId: string) => {
    if (!scannerRef.current) return;
    
    stopScanner();
    setCameraError(null);
    
    try {
      const containerId = "scanner-container";
      
      // Double check the container exists
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.error("Scanner container not found");
        return;
      }
      
      const qrCodeScanner = new Html5Qrcode(containerId);
      html5QrCodeRef.current = qrCodeScanner;
      
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODABAR
      ];
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        formatsToSupport
      };
      
      await qrCodeScanner.start(
        cameraId, 
        config, 
        onScanSuccess,
        onScanFailure
      );
      
      setScanningActive(true);
      console.log("Scanner started successfully");
    } catch (err) {
      console.error("Error starting scanner:", err);
      setCameraError(`Failed to start scanner: ${err.message || "Unknown error"}`);
      setShowManualInput(true);
    }
  };

  const stopScanner = () => {
    setScanningActive(false);
    
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop()
          .then(() => {
            console.log("Scanner stopped successfully");
            html5QrCodeRef.current = null;
          })
          .catch(e => {
            console.log("Error stopping scanner:", e);
            html5QrCodeRef.current = null;
          });
      } catch (e) {
        console.log("Exception stopping scanner:", e);
        html5QrCodeRef.current = null;
      }
    }
  };
  
  const onScanSuccess = (decodedText: string, result: any) => {
    setLastDetectedCode(decodedText);
    
    // Simple vibration feedback
    navigator.vibrate && navigator.vibrate(200);
    
    console.log(`Barcode detected: ${decodedText}`);
    stopScanner();
    processBarcode(decodedText);
  };

  const onScanFailure = (error: string) => {
    // Only log critical errors
    if (error.includes("exception") || error.includes("failed")) {
      console.error("Scan error:", error);
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
            if (isOpen) initializeCamera();
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
          if (isOpen) initializeCamera();
        }, 1500);
      }
    }
  };
  
  const retryCamera = () => {
    setCameraError(null);
    setShowManualInput(false);
    initializeCamera();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Clean up properly before closing
        stopScanner();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md w-[95vw] sm:max-w-lg p-0 rounded-xl">
        <DialogHeader className="px-4 py-3 border-b relative">
          <Button
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={() => {
              stopScanner();
              onClose();
            }}
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
                    id="scanner-container"
                    ref={scannerRef}
                    className="w-full aspect-[3/4] bg-black relative rounded-lg overflow-hidden"
                  >
                    {!scanningActive && !cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                        <Loader2 className="w-8 h-8 animate-spin mr-2" />
                        <p>Starting camera...</p>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-16 border-2 border-blue-500 rounded-md relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -translate-x-2 -translate-y-2"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 translate-x-2 -translate-y-2"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -translate-x-2 translate-y-2"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 translate-x-2 translate-y-2"></div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-1 bg-blue-500 absolute animate-scan"></div>
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
                  onClick={() => {
                    stopScanner();
                    setShowManualInput(true);
                  }}
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
        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0.7;
          }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
};

export default BarcodeScanner;
