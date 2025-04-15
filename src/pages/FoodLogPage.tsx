
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Barcode, 
  ChevronRight, 
  Receipt, 
  Utensils, 
  Library, 
  ArrowLeft,
  History,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FoodLogPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  const handleOptionClick = (option: string) => {
    switch (option) {
      case 'search':
        navigate('/log-meal');
        break;
      case 'scan-barcode':
        navigate('/scan-barcode');
        break;
      case 'scan-nutrition':
        navigate('/scan-nutrition');
        break;
      case 'quick-add':
        navigate('/quick-add');
        break;
      case 'custom-food':
        navigate('/custom-food');
        break;
      case 'custom-recipe':
        navigate('/custom-recipe');
        break;
      case 'saved-foods':
        toast({
          title: "Coming Soon",
          description: "This feature will be available soon!",
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold flex-1">Log Food</h1>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="w-full justify-between py-6 text-lg bg-white"
              onClick={() => handleOptionClick('search')}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <span>Search Foods</span>
              </div>
              <ChevronRight />
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="w-full justify-between py-6 text-lg bg-white"
              onClick={() => handleOptionClick('scan-barcode')}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Barcode className="h-5 w-5 text-purple-600" />
                </div>
                <span>Scan Barcode</span>
              </div>
              <ChevronRight />
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="w-full justify-between py-6 text-lg bg-white"
              onClick={() => handleOptionClick('scan-nutrition')}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Receipt className="h-5 w-5 text-green-600" />
                </div>
                <span>Scan Nutrition Label</span>
              </div>
              <ChevronRight />
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="w-full justify-between py-6 text-lg bg-white"
              onClick={() => handleOptionClick('quick-add')}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <Plus className="h-5 w-5 text-red-600" />
                </div>
                <span>Quick Add</span>
              </div>
              <ChevronRight />
            </Button>
          </motion.div>

          <div className="pt-4">
            <h2 className="text-lg font-medium text-gray-700 mb-3">Custom Options</h2>
          </div>
          
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="w-full justify-between py-6 text-lg bg-white"
              onClick={() => handleOptionClick('custom-food')}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <Utensils className="h-5 w-5 text-amber-600" />
                </div>
                <span>Create Custom Food</span>
              </div>
              <ChevronRight />
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="w-full justify-between py-6 text-lg bg-white"
              onClick={() => handleOptionClick('custom-recipe')}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                  <Utensils className="h-5 w-5 text-cyan-600" />
                </div>
                <span>Create Recipe</span>
              </div>
              <ChevronRight />
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="w-full justify-between py-6 text-lg bg-white"
              onClick={() => handleOptionClick('saved-foods')}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <Star className="h-5 w-5 text-indigo-600" />
                </div>
                <span>Saved Foods & Recipes</span>
              </div>
              <ChevronRight />
            </Button>
          </motion.div>
                    
          <motion.div 
            variants={itemVariants}
            className="pt-4"
          >
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <History className="h-4 w-4 text-gray-500" />
                  <span>Recent Foods</span>
                </h3>
                <p className="text-sm text-gray-500">
                  Your recently logged foods will appear here for quick access.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FoodLogPage;
