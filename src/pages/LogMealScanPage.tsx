
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Barcode, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import BarcodeScanner from '@/components/food-database/BarcodeScanner';
import { FoodDatabaseItem } from '@/types/food';
import { cn } from '@/lib/utils';

const LogMealScanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("barcode");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoBack = () => {
    navigate('/log-meal');
  };

  const handleBarcodeResult = (foodItem: FoodDatabaseItem) => {
    toast({
      title: "Product Found",
      description: `${foodItem.name} has been found. You can now add it to your log.`
    });
    
    // Navigate to the food detail page with the food item
    navigate('/log-meal/search', { 
      state: { selectedFood: foodItem }
    });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    // For now we'll just simulate processing for 2 seconds
    // In a real app you'd send the image to an API for processing
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Label Processing",
        description: "This feature is not fully implemented yet. Coming soon!"
      });
    }, 2000);
  };

  return (
    <div className="h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
        <button 
          className="p-2"
          onClick={handleGoBack}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Scan Food</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="flex w-full justify-center border-b rounded-none bg-white p-0">
          <TabsTrigger 
            value="barcode" 
            className={cn(
              "flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500",
              "data-[state=active]:bg-white data-[state=active]:shadow-none"
            )}
            onClick={() => setShowBarcodeScanner(true)}
          >
            <Barcode size={18} className="mr-2" />
            Barcode
          </TabsTrigger>
          <TabsTrigger 
            value="label" 
            className={cn(
              "flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500",
              "data-[state=active]:bg-white data-[state=active]:shadow-none"
            )}
            onClick={() => setShowBarcodeScanner(false)}
          >
            <Camera size={18} className="mr-2" />
            Nutrition Label
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === 'barcode' ? (
            <motion.div
              key="barcode-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <p className="text-center text-gray-600 mb-6">
                Position the barcode within the scanner frame
              </p>

              {showBarcodeScanner && (
                <BarcodeScanner 
                  isOpen={showBarcodeScanner}
                  onClose={() => setShowBarcodeScanner(false)}
                  onFoodFound={handleBarcodeResult}
                />
              )}

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
            </motion.div>
          ) : (
            <motion.div
              key="label-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-sm mb-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                      <p className="text-gray-600 mt-4">Processing nutrition label...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">
                        Take a clear photo of the nutrition facts label
                      </p>
                      <Button
                        variant="default"
                        className="relative overflow-hidden"
                        onClick={() => {
                          const fileInput = document.getElementById('label-photo');
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        <input
                          id="label-photo"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleUploadImage}
                        />
                        Take Photo
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="text-center max-w-sm">
                  <h3 className="font-medium mb-2">Tips for best results:</h3>
                  <ul className="text-sm text-gray-600 text-left list-disc pl-5 mb-4">
                    <li>Make sure the entire label is visible in the frame</li>
                    <li>Ensure good lighting to avoid shadows</li>
                    <li>Hold the camera steady for a clear image</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default LogMealScanPage;
