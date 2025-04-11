
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GroceryListConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  mealPlanName?: string;
}

const GroceryListConfirmationDialog: React.FC<GroceryListConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  mealPlanName = 'your meal plan'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-dishco-primary" />
            <span>Add ingredients to grocery list?</span>
          </DialogTitle>
          <DialogDescription>
            Would you like to add all ingredients from {mealPlanName} to your grocery list?
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="bg-green-50 rounded-full p-8"
            >
              <ShoppingBag size={48} className="text-dishco-primary" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, x: 30, y: -10 }}
              animate={{ scale: 1, x: 30, y: -10 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.6
              }}
              className="absolute top-0 right-0"
            >
              <CheckCircle className="h-8 w-8 text-green-500" />
            </motion.div>
          </motion.div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onCancel}>
            Skip
          </Button>
          <Button onClick={onConfirm} className="bg-dishco-primary">
            Add to Grocery List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroceryListConfirmationDialog;
