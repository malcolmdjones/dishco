
import { useState } from 'react';
import { MealPlan } from '@/types/mealPlanTypes';

export const usePlanDialogState = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartDateDialogOpen, setIsStartDateDialogOpen] = useState(false);
  
  const [editPlan, setEditPlan] = useState<MealPlan | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return {
    // Edit dialog state
    isEditDialogOpen,
    setIsEditDialogOpen,
    editPlan,
    setEditPlan,
    newPlanName,
    setNewPlanName,
    newPlanDescription,
    setNewPlanDescription,
    
    // Delete dialog state
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    setIsDeleting,
    deletePlanId,
    setDeletePlanId,
    
    // Start date dialog state
    isStartDateDialogOpen,
    setIsStartDateDialogOpen,
    selectedDate,
    setSelectedDate
  };
};
