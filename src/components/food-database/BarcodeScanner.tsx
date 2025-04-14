
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
  const [scanningActive, setScanningActive] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [lastDetectedCode, setLastDetectedCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanFeedback, setScanFeedback] = useState<{ code: string; confidence: number } | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const { toast } = useToast();
  const scannerRef = useRef<HTMLDivElement>(null);
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setManualBarcode('');
      setScanFeedback(null);
      setScanHistory([]);
      setLastDetectedCode(null);
      setCameraError(null);
    } else if (isOpen && !showManualInput) {
      setTimeout(() => startScanner(), 500); // Slight delay to ensure DOM is ready
    }
    
    return () => {
      stopScanner();
    };
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
    
    setCameraError(null);
    setScanningActive(true);
    
    // Configure Quagga with improved settings
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment", // Use back camera
          width: { min: 640 },
          height: { min: 480 },
          aspectRatio: { min: 1, max: 2 }
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: navigator.hardwareConcurrency || 4,
      frequency: 10, // Scan every 10ms for better detection
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader", 
          "upc_reader",
          "upc_e_reader",
          "code_128_reader", 
          "code_39_reader"
        ],
        debug: {
          showCanvas: true,
          showPatches: true,
          showFoundPatches: true,
          showSkeleton: true,
          showLabels: true,
          showPatchLabels: true,
          showRemainingPatchLabels: true,
          boxFromPatches: {
            showTransformed: true,
            showTransformedBox: true,
            showBB: true
          }
        }
      },
      locate: true
    }, function(err) {
      if (err) {
        console.error("Error initializing Quagga:", err);
        setCameraError("Couldn't access your camera. Please check permissions or use manual entry.");
        setShowManualInput(true);
        return;
      }
      
      console.log("Quagga initialized successfully");
      Quagga.start();
      setScanningActive(true);
    });
    
    // Configure detected handler for codes with confidence threshold
    Quagga.onProcessed((result) => {
      if (!result) return;
      
      // Show scan feedback even if not fully detected
      if (result.boxes && result.boxes.length > 0) {
        const hasHighlight = document.querySelector('.highlight-barcode');
        if (!hasHighlight) {
          const highlight = document.createElement('div');
          highlight.className = 'highlight-barcode';
          scannerRef.current?.appendChild(highlight);
        }
      }
    });
    
    // Add more robust scan detection with confidence filtering
    Quagga.onDetected((result) => {
      if (!result.codeResult) return;
      
      const code = result.codeResult.code;
      const confidence = result.codeResult.confidence;
      
      if (!code) return;
      
      // Update scan feedback
      setScanFeedback({ code, confidence });
      
      // Only process codes with good confidence
      if (confidence > 0.75) {
        // Check if this code is new or was just scanned
        if (!scanHistory.includes(code)) {
          // Add to scan history
          setScanHistory(prev => [...prev, code]);
          setLastDetectedCode(code);
          
          // Visual confirmation
          const scanHighlight = document.querySelector('.scan-success');
          if (!scanHighlight) {
            const highlight = document.createElement('div');
            highlight.className = 'scan-success';
            scannerRef.current?.appendChild(highlight);
            setTimeout(() => highlight.remove(), 800);
          }
          
          // Process the barcode
          console.log(`High confidence barcode detected: ${code} (${confidence.toFixed(2)})`);
          processBarcode(code);
        }
      }
    });
  };

  const stopScanner = () => {
    setScanningActive(false);
    setScanFeedback(null);
    
    try {
      Quagga.stop();
    } catch (e) {
      // Ignore errors when stopping if Quagga wasn't started
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    
    await processBarcode(manualBarcode);
  };
  
  const processBarcode = async (code: string) => {
    stopScanner(); // Stop scanning to prevent multiple scans
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
                    className="w-full aspect-[3/4] bg-black relative rounded-lg overflow-hidden"
                  >
                    {/* Quagga will inject the video element here */}
                    
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
                    
                    {scanFeedback && (
                      <div className="absolute bottom-4 left-0 right-0 bg-black/70 text-white text-center py-2 px-3">
                        <p className="text-sm">
                          <span className="font-medium">Detected:</span> {scanFeedback.code}
                          <span className="ml-2 text-xs">
                            ({Math.round(scanFeedback.confidence * 100)}% confidence)
                          </span>
                        </p>
                      </div>
                    )}
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
                <p className="text-xs text-gray-400 mt-1">
                  Try entering the code manually if scanning isn't working
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
        
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .highlight-barcode {
          position: absolute;
          border: 2px solid yellow;
          top: 40%;
          left: 20%;
          width: 60%;
          height: 20%;
          z-index: 10;
          opacity: 0.5;
          pointer-events: none;
        }
        
        .scan-success {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 255, 0, 0.15);
          z-index: 20;
          animation: flash 0.8s ease-out;
          pointer-events: none;
        }
        
        @keyframes flash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        
        .drawingBuffer {
          position: absolute;
          top: 0;
          left: 0;
        }
        
        canvas.drawingBuffer {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </Dialog>
  );
};

export default BarcodeScanner;
