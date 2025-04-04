
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    mealReminders: true,
    weeklyRecaps: true,
    newRecipes: true,
    nutritionAlerts: false,
    appUpdates: true,
    marketingEmails: false
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/settings')}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-dishco-text-light">Manage your notification preferences</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">App Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Meal Reminders</h3>
                <p className="text-sm text-dishco-text-light">Get reminders for your planned meals</p>
              </div>
              <Switch 
                checked={settings.mealReminders} 
                onCheckedChange={() => handleToggle('mealReminders')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Nutrition Alerts</h3>
                <p className="text-sm text-dishco-text-light">Notifications when you exceed daily goals</p>
              </div>
              <Switch 
                checked={settings.nutritionAlerts} 
                onCheckedChange={() => handleToggle('nutritionAlerts')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">New Recipes</h3>
                <p className="text-sm text-dishco-text-light">Be notified when new recipes are available</p>
              </div>
              <Switch 
                checked={settings.newRecipes} 
                onCheckedChange={() => handleToggle('newRecipes')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">App Updates</h3>
                <p className="text-sm text-dishco-text-light">Get notified about app updates</p>
              </div>
              <Switch 
                checked={settings.appUpdates} 
                onCheckedChange={() => handleToggle('appUpdates')} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Email Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Weekly Recaps</h3>
                <p className="text-sm text-dishco-text-light">Get a weekly summary of your nutrition</p>
              </div>
              <Switch 
                checked={settings.weeklyRecaps} 
                onCheckedChange={() => handleToggle('weeklyRecaps')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Marketing Emails</h3>
                <p className="text-sm text-dishco-text-light">Receive promotional offers and updates</p>
              </div>
              <Switch 
                checked={settings.marketingEmails} 
                onCheckedChange={() => handleToggle('marketingEmails')} 
              />
            </div>
          </div>
        </div>

        <Button 
          className="w-full"
          onClick={handleSave}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPage;
