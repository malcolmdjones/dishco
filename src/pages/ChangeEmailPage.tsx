
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ChangeEmailPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentEmail, setCurrentEmail] = useState('john.doe@example.com');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Email change requested",
        description: "Please check your new email for a verification link.",
      });
      navigate('/settings');
    }, 1000);
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
          <h1 className="text-2xl font-bold">Change Email</h1>
          <p className="text-dishco-text-light">Update your email address</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="currentEmail" className="block text-sm font-medium mb-1">Current Email</label>
            <Input 
              id="currentEmail" 
              value={currentEmail} 
              disabled
              className="w-full bg-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium mb-1">New Email</label>
            <Input 
              id="newEmail" 
              type="email"
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)} 
              placeholder="Enter new email address"
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <Input 
              id="password" 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password to confirm"
              className="w-full"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || !newEmail || !password}
        >
          {isLoading ? 'Processing...' : 'Change Email'}
        </Button>
      </form>
    </div>
  );
};

export default ChangeEmailPage;
