
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, User, Mail, Lock, Bell, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Implementation for logout
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const settingsMenu = [
    {
      title: "Profile",
      description: "Edit your personal information",
      icon: <User size={20} />,
      path: "/edit-profile"
    },
    {
      title: "Email",
      description: "Change your email address",
      icon: <Mail size={20} />,
      path: "/change-email"
    },
    {
      title: "Password",
      description: "Update your password",
      icon: <Lock size={20} />,
      path: "/change-password"
    },
    {
      title: "Notifications",
      description: "Manage notification preferences",
      icon: <Bell size={20} />,
      path: "/notifications"
    },
    {
      title: "Privacy & Security",
      description: "Control your privacy settings",
      icon: <Shield size={20} />,
      path: "/privacy"
    }
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
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-dishco-text-light">Manage your account preferences</p>
        </div>
      </header>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center">
        <div className="w-16 h-16 rounded-full bg-dishco-primary flex items-center justify-center mr-4">
          <User size={28} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">John Doe</h2>
          <p className="text-sm text-dishco-text-light">john.doe@example.com</p>
          <Link to="/edit-profile">
            <Button variant="outline" size="sm" className="mt-2">
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="space-y-3 mb-8">
        {settingsMenu.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-full mr-3">
                {item.icon}
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-dishco-text-light">{item.description}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Version Information */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">App Version</h3>
            <p className="text-sm text-dishco-text-light">Current version: 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button 
        variant="outline" 
        size="lg"
        className="w-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut size={18} className="mr-2" />
        Log Out
      </Button>
    </div>
  );
};

export default AccountSettingsPage;
