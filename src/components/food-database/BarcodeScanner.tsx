import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X, Camera, Barcode, ZoomIn } from 'lucide-react';
import { FoodDatabaseItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeResult } from 'html5-qrcode';

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
  const [scanFeedback, setScanFeedback] = useState<{ code: string; confidence?: number } | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{id: string, label: string}>>([]);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt'|'granted'|'denied'|'unknown'>('unknown');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const { toast } = useToast();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      setManualBarcode('');
      setScanFeedback(null);
      setLastDetectedCode(null);
      setCameraError(null);
      stopScanner();
    } else if (isOpen && !showManualInput) {
      checkCameraPermission();
    }
    
    return () => {
      stopScanner();
    };
  }, [isOpen]);
  
  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermissionState(permissionStatus.state as 'prompt'|'granted'|'denied');
        
        permissionStatus.onchange = () => {
          setCameraPermissionState(permissionStatus.state as 'prompt'|'granted'|'denied');
          
          if (permissionStatus.state === 'granted') {
            listCameras();
          } else if (permissionStatus.state === 'denied') {
            setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
            setShowManualInput(true);
          }
        };
        
        if (permissionStatus.state === 'granted') {
          listCameras();
        } else if (permissionStatus.state === 'denied') {
          setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
          setShowManualInput(true);
        }
      } else {
        listCameras();
      }
    } catch (err) {
      console.error("Error checking camera permissions:", err);
      listCameras();
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      if (showManualInput) {
        stopScanner();
      } else if (!scanningActive && cameraPermissionState !== 'denied') {
        listCameras();
      }
    }
  }, [showManualInput, isOpen, cameraPermissionState]);
  
  useEffect(() => {
    if (selectedCamera && isOpen && !showManualInput) {
      startScanner();
    }
  }, [selectedCamera, isOpen, showManualInput]);

  const listCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log("Available cameras:", devices);
      
      if (devices && devices.length > 0) {
        setAvailableCameras(devices);
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
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

  const startScanner = async () => {
    if (!scannerRef.current || !selectedCamera) return;
    
    stopScanner();
    setCameraError(null);
    
    try {
      const qrCodeScanner = new Html5Qrcode(scannerRef.current.id);
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
        fps: 20,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
        formatsToSupport
      };
      
      await qrCodeScanner.start(
        selectedCamera, 
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
    setScanFeedback(null);
    
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop().catch(e => {
          console.log("Error stopping scanner:", e);
        });
        html5QrCodeRef.current = null;
      } catch (e) {
      }
    }
  };
  
  const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
    const now = Date.now();
    if (now - lastScanTime < 2000 && decodedText === lastDetectedCode) {
      return;
    }
    
    setLastScanTime(now);
    setLastDetectedCode(decodedText);
    setScanFeedback({ code: decodedText });
    
    const scanHighlight = document.createElement('div');
    scanHighlight.className = 'scan-success';
    scannerRef.current?.appendChild(scanHighlight);
    setTimeout(() => scanHighlight.remove(), 800);
    
    stopScanner();
    
    navigator.vibrate && navigator.vibrate(200);
    
    console.log(`Barcode detected: ${decodedText}`);
    processBarcode(decodedText);
  };

  const onScanFailure = (error: string) => {
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
        setTimeout(() => {
          if (isOpen) startScanner();
        }, 1500);
      }
    }
  };
  
  const toggleTorch = async () => {
    if (!html5QrCodeRef.current) return;
    
    try {
      const videoTrack = html5QrCodeRef.current.getRunningTrackCameraCapabilities();
      if (!videoTrack) {
        console.log("No video track available");
        return;
      }
      
      if ('torch' in videoTrack) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera || undefined }
        });
        
        const track = stream.getVideoTracks()[0];
        const currentTorchState = track.getSettings().torch;
        
        const newTorchState = !currentTorchState;
        
        try {
          await track.applyConstraints({ 
            advanced: [{ torch: newTorchState }] 
          });
          
          toast({
            title: newTorchState ? "Torch enabled" : "Torch disabled",
            duration: 1000,
          });
        } catch (err) {
          console.log("Failed to toggle torch:", err);
          toast({
            title: "Torch control failed",
            description: "Your device doesn't support torch control",
            variant: "destructive"
          });
        }
        
        stream.getTracks().forEach(track => track.stop());
      } else {
        toast({
          title: "Torch not supported",
          description: "Your device doesn't support the torch feature",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.log("Error toggling torch:", e);
      toast({
        title: "Torch not available",
        description: "Cannot access torch on this device",
        variant: "destructive"
      });
    }
  };
  
  const changeZoom = async (newZoom: number) => {
    if (!html5QrCodeRef.current) return;
    setZoomLevel(newZoom);
    
    try {
      const videoTrack = html5QrCodeRef.current.getRunningTrackCameraCapabilities();
      if (!videoTrack) {
        console.log("No video track available");
        return;
      }
      
      if ('zoom' in videoTrack) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera || undefined }
        });
        
        const track = stream.getVideoTracks()[0];
        
        try {
          await track.applyConstraints({ 
            advanced: [{ zoom: newZoom }] 
          });
        } catch (err) {
          console.log("Failed to apply zoom:", err);
        }
        
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (e) {
      console.log("Error changing zoom:", e);
    }
  };
  
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = e.target.value;
    setSelectedCamera(newCameraId);
  };
  
  const retryCamera = () => {
    setCameraError(null);
    setShowManualInput(false);
    checkCameraPermission();
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
                  {availableCameras.length > 1 && (
                    <select 
                      className="w-full mb-2 p-2 rounded border border-gray-300"
                      value={selectedCamera || ''}
                      onChange={handleCameraChange}
                    >
                      {availableCameras.map(camera => (
                        <option key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${camera.id}`}
                        </option>
                      ))}
                    </select>
                  )}
                  
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
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      <Button 
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-black/50 border-white/30 text-white hover:bg-black/70"
                        onClick={toggleTorch}
                      >
                        <span className="i-lucide-flashlight text-white">
                          🔦
                        </span>
                      </Button>
                      
                      <Button 
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-black/50 border-white/30 text-white hover:bg-black/70"
                        onClick={() => changeZoom(zoomLevel === 1 ? 2 : 1)}
                      >
                        <ZoomIn className={zoomLevel > 1 ? 'text-blue-400' : 'text-white'} />
                      </Button>
                    </div>
                    
                    {scanFeedback && (
                      <div className="absolute bottom-16 left-0 right-0 bg-black/70 text-white text-center py-2 px-3">
                        <p className="text-sm">
                          <span className="font-medium">Detected:</span> {scanFeedback.code}
                          {scanFeedback.confidence && (
                            <span className="ml-2 text-xs">
                              ({Math.round(scanFeedback.confidence * 100)}% confidence)
                            </span>
                          )}
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
              
              {!cameraError && cameraPermissionState !== 'denied' && (
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
      `}</style>
    </Dialog>
  );
};

export default BarcodeScanner;
