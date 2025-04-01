
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Bell, Globe, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const AccountSettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    mealReminders: true,
    metricUnits: false
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));

    toast({
      title: "Setting Updated",
      description: `${setting} has been ${settings[setting] ? 'disabled' : 'enabled'}.`,
    });
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Link to="/more" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-dishco-text-light">Manage your profile and preferences</p>
        </div>
      </header>

      {/* Profile section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-dishco-primary rounded-full flex items-center justify-center mr-4">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">John Doe</h2>
            <p className="text-dishco-text-light">john.doe@example.com</p>
          </div>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <User size={18} className="mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Mail size={18} className="mr-2" />
            Change Email
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Lock size={18} className="mr-2" />
            Change Password
          </Button>
        </div>
      </div>

      {/* Preferences section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="font-semibold text-lg mb-4">Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell size={20} className="mr-3 text-dishco-primary" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-dishco-text-light">Get alerts for meal reminders</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={() => handleToggle('notifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Moon size={20} className="mr-3 text-dishco-primary" />
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-dishco-text-light">Switch to dark theme</p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={() => handleToggle('darkMode')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail size={20} className="mr-3 text-dishco-primary" />
              <div>
                <p className="font-medium">Email Updates</p>
                <p className="text-sm text-dishco-text-light">Receive weekly meal suggestions</p>
              </div>
            </div>
            <Switch
              checked={settings.emailUpdates}
              onCheckedChange={() => handleToggle('emailUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell size={20} className="mr-3 text-dishco-primary" />
              <div>
                <p className="font-medium">Meal Reminders</p>
                <p className="text-sm text-dishco-text-light">Daily reminders for planned meals</p>
              </div>
            </div>
            <Switch
              checked={settings.mealReminders}
              onCheckedChange={() => handleToggle('mealReminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe size={20} className="mr-3 text-dishco-primary" />
              <div>
                <p className="font-medium">Metric Units</p>
                <p className="text-sm text-dishco-text-light">Use metric instead of imperial</p>
              </div>
            </div>
            <Switch
              checked={settings.metricUnits}
              onCheckedChange={() => handleToggle('metricUnits')}
            />
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button 
        variant="outline" 
        className="w-full border-gray-300"
        onClick={() => toast({
          title: "Not Implemented",
          description: "Logout functionality will be available in the production version.",
        })}
      >
        <LogOut size={18} className="mr-2" />
        <span>Log Out</span>
      </Button>
    </div>
  );
};

export default AccountSettingsPage;
