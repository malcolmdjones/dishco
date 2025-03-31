
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PageHeaderContentProps {
  onOpenVault: () => void;
  onOpenWeekOverview: () => void;
}

const PageHeaderContent: React.FC<PageHeaderContentProps> = ({ 
  onOpenVault, 
  onOpenWeekOverview 
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
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
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onOpenVault}
            title="Recipe Vault"
          >
            <BookOpen size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenWeekOverview}
          >
            Overview
          </Button>
        </div>
      </div>
      <p className="text-dishco-text-light mb-4">Plan and customize your meals</p>
    </>
  );
};

export default PageHeaderContent;
