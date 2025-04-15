
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Camera, Barcode, PlusCircle, ChefHat, FileText, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Method option interface
interface LogMethod {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  route: string;
  color: string;
}

const LogMealPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("methods");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Define the logging methods
  const loggingMethods: LogMethod[] = [
    {
      id: 'search',
      name: 'Search',
      icon: Search,
      description: 'Find foods in our database',
      route: '/log-meal/search',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'scan',
      name: 'Scan',
      icon: Barcode,
      description: 'Scan barcode or nutrition label',
      route: '/log-meal/scan',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'quick-add',
      name: 'Quick Add',
      icon: PlusCircle,
      description: 'Manually enter nutrition info',
      route: '/log-meal/quick-add',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'custom',
      name: 'Custom Food',
      icon: FileText,
      description: 'Create your own food item',
      route: '/log-meal/custom-food',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'recipe',
      name: 'Recipe',
      icon: ChefHat,
      description: 'Create a multi-ingredient recipe',
      route: '/log-meal/custom-recipe',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/log-meal/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      toast({
        title: "Empty Search",
        description: "Please enter something to search for",
      });
    }
  };

  return (
    <div className="h-full pb-16 bg-white">
      <div className="flex justify-center items-center py-3 border-b sticky top-0 bg-white z-10">
        <button 
          className="absolute left-4"
          onClick={handleGoBack}
          aria-label="Go back"
        >
          <X size={24} />
        </button>
        <h1 className="text-xl font-semibold text-blue-600">Log a Meal</h1>
      </div>

      <Tabs 
        defaultValue="methods" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="flex w-full justify-center border-b rounded-none bg-white p-0">
          <TabsTrigger 
            value="methods" 
            className={cn(
              "flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500",
              "data-[state=active]:bg-white data-[state=active]:shadow-none"
            )}
          >
            Methods
          </TabsTrigger>
          <TabsTrigger 
            value="recent" 
            className={cn(
              "flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500",
              "data-[state=active]:bg-white data-[state=active]:shadow-none"
            )}
          >
            Recent
          </TabsTrigger>
          <TabsTrigger 
            value="my-foods" 
            className={cn(
              "flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500",
              "data-[state=active]:bg-white data-[state=active]:shadow-none"
            )}
          >
            My Foods
          </TabsTrigger>
        </TabsList>

        <div className="px-4 py-4">
          <div className="relative flex items-center mb-5">
            <Input
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-gray-100 pl-10 pr-4 py-3 rounded-full border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
            />
            <Search className="absolute left-3 text-gray-400" size={20} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <TabsContent value="methods" className="pt-0 px-4 pb-4 mt-0">
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              {loggingMethods.map((method, idx) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "flex items-center justify-start w-full p-4 h-auto border rounded-xl shadow-sm transition-all",
                      "hover:bg-gray-50 hover:shadow-md"
                    )}
                    onClick={() => handleNavigate(method.route)}
                  >
                    <div className={cn("p-3 rounded-full mr-4", method.color)}>
                      <method.icon size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-medium">{method.name}</h3>
                      <p className="text-gray-500 text-sm">{method.description}</p>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="recent" className="pt-0 px-4 pb-4 mt-0">
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 mb-2">You don't have any recent foods</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setActiveTab("methods")}
            >
              Log your first meal
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="my-foods" className="pt-0 px-4 pb-4 mt-0">
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 mb-2">You haven't created any foods yet</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => navigate('/log-meal/custom-food')}
            >
              Create custom food
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogMealPage;
