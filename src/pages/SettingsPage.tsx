
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Lock, HelpCircle, Info, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    {
      name: 'Edit Profile',
      icon: <User size={20} className="text-blue-500" />,
      path: '/settings/edit-profile',
      description: 'Manage your personal information'
    },
    {
      name: 'Notifications',
      icon: <Bell size={20} className="text-purple-500" />,
      path: '/notifications',
      description: 'Configure your notification preferences'
    },
    {
      name: 'Privacy & Security',
      icon: <Lock size={20} className="text-green-500" />,
      path: '/privacy-security',
      description: 'Manage your account security settings'
    },
    {
      name: 'Help & Support',
      icon: <HelpCircle size={20} className="text-amber-500" />,
      path: '/help',
      description: 'Get help and contact support'
    },
    {
      name: 'About',
      icon: <Info size={20} className="text-gray-500" />,
      path: '/about',
      description: 'Learn more about our app'
    },
  ];

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/more')}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-dishco-text-light">Manage your account preferences</p>
        </div>
      </header>

      <div className="space-y-4">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center">
              <div className="mr-4">
                {item.icon}
              </div>
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-dishco-text-light">{item.description}</p>
              </div>
            </div>
            <ArrowLeft size={20} className="text-gray-400 transform rotate-180" />
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center text-red-500 border-red-200 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut size={18} className="mr-2" />
        <span>Log Out</span>
      </Button>
    </div>
  );
};

export default SettingsPage;
