
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { scanBarcode } from '@/services/foodDatabaseService';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
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
  const { toast } = useToast();
  
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    
    setIsSearching(true);
    try {
      const food = await scanBarcode(manualBarcode);
      setIsSearching(false);
      
      if (food) {
        onFoodFound(food);
        onClose();
      } else {
        toast({
          title: "Product Not Found",
          description: "We couldn't find this product in our database.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
      toast({
        title: "Scan Error",
        description: "There was an error scanning the barcode.",
        variant: "destructive"
      });
      setIsSearching(false);
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
            Scan Barcode
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Enter a barcode number to search for the product
            </p>
            
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
            
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-2">
                Note: Currently scanning with device camera is not available. 
                Please enter the barcode number manually.
              </p>
              <p className="text-xs text-gray-400">
                Common barcode formats: EAN-13, UPC-A
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
