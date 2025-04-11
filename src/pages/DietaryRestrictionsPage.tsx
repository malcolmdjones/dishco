
import React, { useState, useEffect } from 'react';
import { Check, Info, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface DietaryRestriction {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const DietaryRestrictionsPage = () => {
  const { toast } = useToast();
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([
    {
      id: 'vegetarian',
      name: 'Vegetarian',
      description: 'Excludes meat, fish, and poultry',
      enabled: false
    },
    {
      id: 'vegan',
      name: 'Vegan',
      description: 'Excludes all animal products including dairy and eggs',
      enabled: false
    },
    {
      id: 'gluten-free',
      name: 'Gluten-Free',
      description: 'Excludes wheat, barley, rye, and other gluten-containing ingredients',
      enabled: false
    },
    {
      id: 'dairy-free',
      name: 'Dairy-Free',
      description: 'Excludes milk, cheese, and other dairy products',
      enabled: false
    },
    {
      id: 'nut-free',
      name: 'Nut-Free',
      description: 'Excludes peanuts and tree nuts',
      enabled: false
    },
    {
      id: 'keto',
      name: 'Keto',
      description: 'Very low-carb, high-fat diet',
      enabled: false
    },
    {
      id: 'paleo',
      name: 'Paleo',
      description: 'Focuses on whole foods, excludes processed foods, grains, legumes, and dairy',
      enabled: false
    },
    {
      id: 'low-sodium',
      name: 'Low-Sodium',
      description: 'Restricts salt and high-sodium ingredients',
      enabled: false
    }
  ]);

  // Placeholder for future database integration
  const saveRestrictions = async () => {
    try {
      // In a real app, you would save this to the database
      // For now, just store in localStorage
      localStorage.setItem('dietaryRestrictions', JSON.stringify(
        restrictions.filter(r => r.enabled).map(r => r.id)
      ));
      
      toast({
        title: "Preferences Saved",
        description: "Your dietary restrictions have been updated.",
      });
    } catch (error) {
      console.error('Error saving restrictions:', error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Load saved restrictions on initial render
  useEffect(() => {
    const savedRestrictions = localStorage.getItem('dietaryRestrictions');
    if (savedRestrictions) {
      try {
        const savedIds = JSON.parse(savedRestrictions) as string[];
        setRestrictions(prev => 
          prev.map(r => ({
            ...r,
            enabled: savedIds.includes(r.id)
          }))
        );
      } catch (e) {
        console.error('Error loading saved restrictions:', e);
      }
    }
  }, []);

  const toggleRestriction = (id: string) => {
    setRestrictions(prev => 
      prev.map(r => 
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/more">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Dietary Restrictions</h1>
        </div>
        <p className="text-dishco-text-light">Customize your meal recommendations</p>
      </header>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <p className="text-sm text-dishco-text-light mb-4">
          Select your dietary needs and preferences. We'll use these to filter and customize your meal recommendations.
        </p>
        
        <div className="space-y-4">
          {restrictions.map((restriction) => (
            <div key={restriction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium">{restriction.name}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                        <Info size={14} className="text-gray-400" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">{restriction.description}</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Switch 
                checked={restriction.enabled}
                onCheckedChange={() => toggleRestriction(restriction.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 mb-6">
        <div>
          <h3 className="font-medium">Additional Allergies</h3>
          <p className="text-sm text-dishco-text-light">Coming soon: Add custom allergies</p>
        </div>
        <Button variant="outline" disabled>
          Add
        </Button>
      </div>

      <Button className="w-full" onClick={saveRestrictions}>
        Save Preferences
      </Button>
    </div>
  );
};

export default DietaryRestrictionsPage;
