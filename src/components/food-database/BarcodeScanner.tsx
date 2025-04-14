
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X, Camera, Barcode } from 'lucide-react';
import { FoodDatabaseItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanning = useRef<boolean>(false);
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
    if (!videoRef.current) return;
    
    stopScanner();
    
    setCameraError(null);
    scanning.current = true;
    lastScannedCode.current = null;
    validationBuffer.current = [];
    
    try {
      const hints = new Map();
      
      const formats = [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ];
      
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      const reader = new BrowserMultiFormatReader(hints);
      readerRef.current = reader;
      
      // Use the navigator.mediaDevices API directly instead of BrowserMultiFormatReader.listVideoInputDevices
      let deviceId = '';
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          setCameraError("No camera detected. Please use manual entry instead.");
          setShowManualInput(true);
          return;
        }
        
        const environmentCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        deviceId = environmentCamera ? environmentCamera.deviceId : videoDevices[0].deviceId;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        // Fall back to default camera if can't enumerate devices
      }
      
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        }
      };
      
      await reader.decodeFromConstraints(constraints, videoRef.current, (result, error) => {
        if (!scanning.current) return;
        
        if (error) {
          return;
        }
        
        if (result) {
          const code = result.getText();
          
          if (!/^\d{8,13}$/.test(code)) {
            return;
          }
          
          console.log(`Detected barcode: ${code}`);
          
          validationBuffer.current.push({
            code,
            timestamp: Date.now()
          });
          
          const now = Date.now();
          validationBuffer.current = validationBuffer.current.filter(item => 
            now - item.timestamp < 3000
          );
          
          const occurrences = validationBuffer.current.filter(item => item.code === code).length;
          
          if (occurrences >= 2 && code !== lastScannedCode.current) {
            lastScannedCode.current = code;
            scanning.current = false;
            
            stopScanner();
            processBarcode(code);
          }
        }
      });
      
      console.log("Scanner started successfully");
    } catch (err) {
      console.error("Error starting scanner:", err);
      setCameraError("Couldn't access your camera. Please check permissions or use manual entry.");
      setShowManualInput(true);
    }
  };

  const stopScanner = () => {
    try {
      if (readerRef.current) {
        console.log("Stopping scanner");
        readerRef.current.reset();
        readerRef.current = null;
      }
      scanning.current = false;
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
              scanning.current = true;
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
            scanning.current = true;
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
                  <div className="w-full aspect-[4/3] bg-black rounded-lg overflow-hidden relative">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                    ></video>
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
