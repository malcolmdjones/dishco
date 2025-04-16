import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Plus, Scan, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import BarcodeScanner from '@/components/food-database/BarcodeScanner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ShelfItem {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  productInfo: {
    name: string;
    brand?: string;
    imageSrc?: string;
    scanDate: string;
    // other product info
    [key: string]: any;
  };
}

const MyShelfPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [shelfItems, setShelfItems] = useState<ShelfItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  useEffect(() => {
    // Load shelf items from localStorage
    const storedItems = localStorage.getItem('myShelfItems');
    if (storedItems) {
      setShelfItems(JSON.parse(storedItems));
    }
    setIsLoading(false);
  }, []);

  const handleFoodFound = (food: any) => {
    // Create a new shelf item from scanned product
    const newItem: ShelfItem = {
      id: `shelf-${Date.now()}`,
      name: food.name || 'Unknown Item',
      productInfo: {
        ...food,
        scanDate: new Date().toISOString()
      }
    };

    const updatedItems = [...shelfItems, newItem];
    setShelfItems(updatedItems);
    localStorage.setItem('myShelfItems', JSON.stringify(updatedItems));

    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your shelf.`
    });
    
    setIsScannerOpen(false);
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = shelfItems.filter(item => item.id !== id);
    setShelfItems(updatedItems);
    localStorage.setItem('myShelfItems', JSON.stringify(updatedItems));
    
    toast({
      title: "Item Removed",
      description: "Item has been removed from your shelf."
    });
  };

  const handleClearAllItems = () => {
    setShelfItems([]);
    localStorage.setItem('myShelfItems', JSON.stringify([]));
    setShowClearAllDialog(false);
    
    toast({
      title: "Shelf Cleared",
      description: "All items have been removed from your shelf."
    });
  };

  // Filter items based on search term
  const filteredItems = shelfItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.productInfo.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">My Shelf</h1>
        </div>
        <p className="text-dishco-text-light">Your preferred grocery items</p>
      </header>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search shelf items..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dishco-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 justify-between">
          <Button
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 bg-dishco-primary text-white"
          >
            <Scan size={18} className="mr-2" />
            Scan New Item
          </Button>

          {shelfItems.length > 0 && (
            <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                  <Trash2 size={18} className="mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all shelf items?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all items from your shelf. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllItems} className="bg-red-500 hover:bg-red-600">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading your shelf items...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <ShelfItemCard 
              key={item.id} 
              item={item} 
              onRemove={() => handleRemoveItem(item.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <div className="mb-4">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Scan size={24} className="text-gray-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium">Your shelf is empty</h3>
          <p className="text-gray-500 mt-2 mb-6">
            Scan grocery items or add them from your grocery list
          </p>
          <Button onClick={() => setIsScannerOpen(true)}>
            <Scan size={18} className="mr-2" />
            Scan Item
          </Button>
        </div>
      )}

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onFoodFound={handleFoodFound}
      />
    </div>
  );
};

interface ShelfItemCardProps {
  item: ShelfItem;
  onRemove: () => void;
}

const ShelfItemCard: React.FC<ShelfItemCardProps> = ({ item, onRemove }) => {
  // Format the scan date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex p-4">
        <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
          {item.productInfo.imageSrc ? (
            <img 
              src={item.productInfo.imageSrc} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs text-center">No image</span>
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className="font-medium">{item.name}</h3>
          {item.productInfo.brand && (
            <p className="text-sm text-gray-500">{item.productInfo.brand}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Added on {formatDate(item.productInfo.scanDate)}
          </p>

          <div className="mt-3 flex justify-between items-center">
            {item.productInfo.macros && (
              <div className="text-xs text-gray-600">
                {item.productInfo.macros.calories && (
                  <span className="mr-3">{item.productInfo.macros.calories} cal</span>
                )}
                {item.productInfo.macros.protein && (
                  <span className="mr-3">{item.productInfo.macros.protein}g protein</span>
                )}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRemove}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyShelfPage;
