
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X, Camera, Barcode } from 'lucide-react';
import { FoodDatabaseItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Start camera when scanner is opened
  useEffect(() => {
    if (isOpen && !showManualInput) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, showManualInput]);

  // Handle barcode scanning at regular intervals
  useEffect(() => {
    let scanInterval: number | null = null;
    
    if (scanningActive && videoRef.current && canvasRef.current) {
      scanInterval = window.setInterval(() => {
        captureAndCheckBarcode();
      }, 500); // Scan every 500ms
    }
    
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanningActive]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanningActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Couldn't access your camera. Please check permissions or use manual entry.");
      setShowManualInput(true);
    }
  };

  const stopCamera = () => {
    setScanningActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureAndCheckBarcode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanningActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // This would be replaced with an actual barcode detection library
      // For demo purposes, we'll simulate a successful scan after a few seconds
      if (Math.random() > 0.9) { // 10% chance of "detecting" a barcode each scan
        const simulatedBarcodes = ['3017624010701', '5449000000996', '8410795505533'];
        const randomBarcode = simulatedBarcodes[Math.floor(Math.random() * simulatedBarcodes.length)];
        
        // Stop scanning and process the barcode
        setScanningActive(false);
        await processBarcode(randomBarcode);
      }
    } catch (error) {
      console.error("Error processing barcode:", error);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    
    await processBarcode(manualBarcode);
  };
  
  const processBarcode = async (code: string) => {
    setIsSearching(true);
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
        toast({
          title: "Product Not Found",
          description: "We couldn't find this product in our database.",
          variant: "destructive"
        });
        // Return to scanning if in camera mode
        if (!showManualInput) {
          setScanningActive(true);
        }
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
      toast({
        title: "Scan Error",
        description: "There was an error scanning the barcode.",
        variant: "destructive"
      });
      setIsSearching(false);
      if (!showManualInput) {
        setScanningActive(true);
      }
    }
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
                </div>
              ) : (
                <div className="relative">
                  <div className="w-full aspect-[3/4] bg-black relative rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-16 border-2 border-blue-500 rounded-md relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -translate-x-2 -translate-y-2"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 translate-x-2 -translate-y-2"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -translate-x-2 translate-y-2"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 translate-x-2 translate-y-2"></div>
                      </div>
                    </div>
                    
                    {/* Scanning animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-1 bg-blue-500 absolute animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                  
                  <p className="text-center mt-4 text-sm text-gray-600">
                    Center the barcode within the blue frame
                  </p>
                  
                  {/* Hidden canvas for image processing */}
                  <canvas 
                    ref={canvasRef} 
                    className="hidden"
                  ></canvas>
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
                  Common barcode formats: EAN-13, UPC-A
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
      
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default BarcodeScanner;
