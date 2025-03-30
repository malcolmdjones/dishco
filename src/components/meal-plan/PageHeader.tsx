
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/planning')} 
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">New Meal Plan</h1>
      </div>
      <p className="text-dishco-text-light mb-4">Plan and customize your meals</p>
    </div>
  );
};

export default PageHeader;
