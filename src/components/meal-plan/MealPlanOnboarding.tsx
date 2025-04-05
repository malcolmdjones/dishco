
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CheckIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingPreferences {
  days: number;
  mealMood: string[];
  proteinFocus: string[];
  cravings: string[];
  cuisineVibes: string[];
}

interface MealPlanOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const MealPlanOnboarding: React.FC<MealPlanOnboardingProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<OnboardingPreferences>({
    days: 7,
    mealMood: [],
    proteinFocus: [],
    cravings: [],
    cuisineVibes: []
  });

  const handleDaysChange = (value: number) => {
    setPreferences(prev => ({ ...prev, days: value }));
  };

  const handleToggleSelection = (category: keyof Omit<OnboardingPreferences, 'days'>, value: string) => {
    setPreferences(prev => {
      const currentValues = prev[category];
      if (Array.isArray(currentValues)) {
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [category]: newValues };
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const completeOnboarding = () => {
    // Here you would typically save the preferences to state or localStorage
    localStorage.setItem('mealPlanPreferences', JSON.stringify(preferences));
    
    toast({
      title: "Preferences saved!",
      description: `Creating a ${preferences.days}-day meal plan based on your selections.`
    });
    
    // Navigate to the create meal plan page
    navigate('/create-meal-plan', { state: { preferences } });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {currentStep === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">How many days are you meal prepping for?</DialogTitle>
              <DialogDescription className="text-center">
                Select the number of days you want to plan meals for.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <RadioGroup 
                value={preferences.days.toString()} 
                onValueChange={(value) => handleDaysChange(parseInt(value))}
                className="grid grid-cols-4 gap-2 py-2"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className="flex items-center justify-center">
                    <RadioGroupItem 
                      value={day.toString()} 
                      id={`day-${day}`} 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor={`day-${day}`} 
                      className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-primary text-center peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer"
                    >
                      <span className="text-lg font-medium">{day}</span>
                      <span className="text-[10px]">{day === 1 ? 'day' : 'days'}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </DialogFooter>
          </>
        )}
        
        {currentStep === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">What's the vibe for this week? 🍽️</DialogTitle>
              <DialogDescription className="text-center">
                No pressure—just pick what sounds good! We'll mix and match the perfect meals for you.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 flex flex-col space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h3 className="font-medium mb-2">🍱 Meal Mood <span className="text-sm font-normal text-muted-foreground">(Select as many as you like)</span></h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Quick & Easy ⚡', value: 'quick' },
                    { label: 'Cozy & Comforting 🛋️', value: 'cozy' },
                    { label: 'Fresh & Light 🌿', value: 'fresh' },
                    { label: 'High-Energy 💪', value: 'high-energy' },
                    { label: 'Low Cost 💸', value: 'low-cost' },
                    { label: 'Minimal Prep ⏳', value: 'minimal-prep' },
                    { label: 'I Don\'t Mind Cooking 🧑‍🍳', value: 'cooking' }
                  ].map((item) => (
                    <Toggle
                      key={item.value}
                      variant="outline"
                      size="sm"
                      pressed={preferences.mealMood.includes(item.value)}
                      onPressedChange={() => handleToggleSelection('mealMood', item.value)}
                      className="justify-start h-auto py-2 px-3"
                    >
                      <span className="text-left">{item.label}</span>
                      {preferences.mealMood.includes(item.value) && (
                        <CheckIcon className="ml-auto h-4 w-4" />
                      )}
                    </Toggle>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">🍖 Protein Focus</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Chicken 🍗', value: 'chicken' },
                    { label: 'Beef 🥩', value: 'beef' },
                    { label: 'Fish 🐟', value: 'fish' },
                    { label: 'Eggs 🥚', value: 'eggs' },
                    { label: 'Tofu 🥢', value: 'tofu' },
                    { label: 'Plant-Based 🌱', value: 'plant-based' }
                  ].map((item) => (
                    <Toggle
                      key={item.value}
                      variant="outline"
                      size="sm"
                      pressed={preferences.proteinFocus.includes(item.value)}
                      onPressedChange={() => handleToggleSelection('proteinFocus', item.value)}
                      className="justify-start h-auto py-2 px-3"
                    >
                      <span className="text-left">{item.label}</span>
                      {preferences.proteinFocus.includes(item.value) && (
                        <CheckIcon className="ml-auto h-4 w-4" />
                      )}
                    </Toggle>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </DialogFooter>
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Final preferences</DialogTitle>
              <DialogDescription className="text-center">
                Let's finish up with your cravings and cuisine preferences.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 flex flex-col space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h3 className="font-medium mb-2">🍽️ Cravings & Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Spicy 🌶️', value: 'spicy' },
                    { label: 'Savory', value: 'savory' },
                    { label: 'Breakfast 🍳', value: 'breakfast' },
                    { label: 'Smoothies 🥤', value: 'smoothies' },
                    { label: 'Wraps 🌯', value: 'wraps' },
                    { label: 'Salads 🥗', value: 'salads' },
                    { label: 'Rice Bowls 🍚', value: 'rice-bowls' },
                    { label: 'Pasta 🍝', value: 'pasta' },
                    { label: 'Baked Goods 🍪', value: 'baked-goods' },
                    { label: 'Snack Cravings 🍿', value: 'snacks' }
                  ].map((item) => (
                    <Toggle
                      key={item.value}
                      variant="outline"
                      size="sm"
                      pressed={preferences.cravings.includes(item.value)}
                      onPressedChange={() => handleToggleSelection('cravings', item.value)}
                      className="justify-start h-auto py-2 px-3"
                    >
                      <span className="text-left">{item.label}</span>
                      {preferences.cravings.includes(item.value) && (
                        <CheckIcon className="ml-auto h-4 w-4" />
                      )}
                    </Toggle>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Cuisine Vibes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Asian', value: 'asian' },
                    { label: 'Mexican', value: 'mexican' },
                    { label: 'Indian', value: 'indian' },
                    { label: 'American', value: 'american' },
                    { label: 'Fusion', value: 'fusion' }
                  ].map((item) => (
                    <Toggle
                      key={item.value}
                      variant="outline"
                      size="sm"
                      pressed={preferences.cuisineVibes.includes(item.value)}
                      onPressedChange={() => handleToggleSelection('cuisineVibes', item.value)}
                      className="justify-start h-auto py-2 px-3"
                    >
                      <span>{item.label}</span>
                      {preferences.cuisineVibes.includes(item.value) && (
                        <CheckIcon className="ml-auto h-4 w-4" />
                      )}
                    </Toggle>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Create My Plan
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanOnboarding;
