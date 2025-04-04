
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PrivacySecurityPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    dataSharingConsent: true,
    anonymousUsageData: true,
    activityStatus: true,
    locationServices: false
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    
    if (setting === 'twoFactorAuth' && !settings.twoFactorAuth) {
      // Show a toast message when enabling 2FA
      toast({
        title: "2FA Setup Required",
        description: "Please complete the 2FA setup process.",
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your privacy and security preferences have been updated.",
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
          <h1 className="text-2xl font-bold">Privacy & Security</h1>
          <p className="text-dishco-text-light">Manage your privacy settings</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Security</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-dishco-text-light">Add an extra layer of security</p>
              </div>
              <Switch 
                checked={settings.twoFactorAuth} 
                onCheckedChange={() => handleToggle('twoFactorAuth')} 
              />
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => navigate('/change-password')}>
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            
            <div className="bg-amber-50 p-3 rounded-md flex items-start">
              <AlertTriangle className="text-amber-500 mr-2 h-5 w-5 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">Security Alert</p>
                <p className="text-xs text-amber-600">Last login: Today at 10:30 AM from New York, USA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Privacy</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Data Sharing Consent</h3>
                <p className="text-sm text-dishco-text-light">Allow anonymous data sharing to improve services</p>
              </div>
              <Switch 
                checked={settings.dataSharingConsent} 
                onCheckedChange={() => handleToggle('dataSharingConsent')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Anonymous Usage Data</h3>
                <p className="text-sm text-dishco-text-light">Share app usage data to improve features</p>
              </div>
              <Switch 
                checked={settings.anonymousUsageData} 
                onCheckedChange={() => handleToggle('anonymousUsageData')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Activity Status</h3>
                <p className="text-sm text-dishco-text-light">Show when you're active in the app</p>
              </div>
              <Switch 
                checked={settings.activityStatus} 
                onCheckedChange={() => handleToggle('activityStatus')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Location Services</h3>
                <p className="text-sm text-dishco-text-light">Allow app to access your location</p>
              </div>
              <Switch 
                checked={settings.locationServices} 
                onCheckedChange={() => handleToggle('locationServices')} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            Download My Data
          </Button>
          
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
            Delete Account
          </Button>
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

export default PrivacySecurityPage;

// Fix missing Lock component import
const Lock = ({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
