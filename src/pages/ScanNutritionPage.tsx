
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NutritionLabelData } from '@/types/food';
import { useIsMobile } from '@/hooks/use-mobile';

// Mockup of nutrition label extraction API
const mockExtractNutrition = (imageData: string): Promise<NutritionLabelData> => {
  // This would be replaced with an actual API call to OCR service
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulated nutrition data
      resolve({
        calories: 200,
        totalFat: 8,
        saturatedFat: 1,
        transFat: 0,
        cholesterol: 0,
        sodium: 140,
        totalCarbs: 28,
        fiber: 4,
        sugar: 12,
        protein: 6,
        servingSize: '100',
        servingUnit: 'g'
      });
    }, 2000);
  });
};

const ScanNutritionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<NutritionLabelData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access your camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (!videoRef.current?.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setImagePreview(imageData);
    processImage(imageData);
    
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setImagePreview(imageData);
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData: string) => {
    setScanning(true);
    
    try {
      // In a real application, this would call an OCR API
      const nutrition = await mockExtractNutrition(imageData);
      setExtractedData(nutrition);
      setShowPreview(true);
      
      toast({
        title: 'Nutrition Extracted',
        description: 'Nutrition facts have been extracted from the label.'
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to extract nutrition information from the image.',
        variant: 'destructive'
      });
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setExtractedData(null);
    setShowPreview(false);
  };

  const saveAndContinue = () => {
    if (!extractedData) return;
    
    // Save extracted data to localStorage for the custom food creation page
    localStorage.setItem('extractedNutrition', JSON.stringify(extractedData));
    
    // Navigate to the custom food page
    navigate('/custom-food');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopCamera();
              navigate(-1);
            }}
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold">Scan Nutrition Label</h1>
          <div className="w-10"></div>
        </div>
      </div>
      
      <motion.div 
        className="max-w-lg mx-auto px-4 py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!showPreview ? (
          <>
            {!imagePreview ? (
              <>
                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    Point your camera at a nutrition facts label
                  </p>
                  <p className="text-sm text-gray-500">
                    Make sure the label is well-lit and clearly visible
                  </p>
                </div>
                
                <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] flex items-center justify-center">
                  {cameraActive ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className="max-h-full max-w-full"
                    ></video>
                  ) : imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Captured nutrition label" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-white text-center p-6">
                      <Camera size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Camera preview will appear here</p>
                    </div>
                  )}
                  
                  {scanning && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center flex-col space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-white" />
                      <p className="text-white">Scanning nutrition label...</p>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  {cameraActive ? (
                    <Button 
                      className="w-full py-6 bg-blue-600 hover:bg-blue-700"
                      onClick={captureImage}
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Capture
                    </Button>
                  ) : (
                    <Button 
                      className="w-full py-6"
                      onClick={startCamera}
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Use Camera
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full py-6"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Image
                  </Button>
                </div>
                
                {cameraActive && (
                  <p className="text-xs text-center text-gray-500">
                    Position the nutrition facts label in the frame and tap Capture
                  </p>
                )}
              </>
            ) : scanning ? (
              <div className="text-center space-y-4 py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                <p className="text-lg">Analyzing nutrition label...</p>
                <p className="text-sm text-gray-500">This may take a moment</p>
              </div>
            ) : null}
          </>
        ) : extractedData ? (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
              >
                <Check className="h-8 w-8 text-green-600" />
              </motion.div>
              <h2 className="text-xl font-medium">Nutrition Facts Extracted</h2>
              <p className="text-gray-600 mt-1">Review and continue</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg border-b pb-1 mb-4">Nutrition Facts</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Serving Size</span>
                  <span>{extractedData.servingSize} {extractedData.servingUnit}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-bold">
                    <span>Calories</span>
                    <span>{extractedData.calories}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Fat</span>
                    <span>{extractedData.totalFat}g</span>
                  </div>
                  {extractedData.saturatedFat !== undefined && (
                    <div className="flex justify-between items-center pl-4 text-sm mt-1">
                      <span>Saturated Fat</span>
                      <span>{extractedData.saturatedFat}g</span>
                    </div>
                  )}
                  {extractedData.transFat !== undefined && (
                    <div className="flex justify-between items-center pl-4 text-sm mt-1">
                      <span>Trans Fat</span>
                      <span>{extractedData.transFat}g</span>
                    </div>
                  )}
                </div>
                
                {extractedData.cholesterol !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>Cholesterol</span>
                    <span>{extractedData.cholesterol}mg</span>
                  </div>
                )}
                
                {extractedData.sodium !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>Sodium</span>
                    <span>{extractedData.sodium}mg</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Carbs</span>
                    <span>{extractedData.totalCarbs}g</span>
                  </div>
                  {extractedData.fiber !== undefined && (
                    <div className="flex justify-between items-center pl-4 text-sm mt-1">
                      <span>Dietary Fiber</span>
                      <span>{extractedData.fiber}g</span>
                    </div>
                  )}
                  {extractedData.sugar !== undefined && (
                    <div className="flex justify-between items-center pl-4 text-sm mt-1">
                      <span>Sugars</span>
                      <span>{extractedData.sugar}g</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-medium">
                    <span>Protein</span>
                    <span>{extractedData.protein}g</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button variant="outline" onClick={reset}>
                Retake
              </Button>
              <Button className="bg-blue-600" onClick={saveAndContinue}>
                Continue
              </Button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default ScanNutritionPage;
