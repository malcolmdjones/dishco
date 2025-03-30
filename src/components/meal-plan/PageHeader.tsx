
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  onOpenVault: () => void;
  onOpenWeekOverview: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onOpenVault, onOpenWeekOverview }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">New Meal Plan</h1>
          <p className="text-dishco-text-light mt-1">Plan and customize your meals</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onOpenWeekOverview}
          >
            Overview
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onOpenVault}
          >
            <BookOpen size={16} className="mr-1.5" />
            Recipe Vault
          </Button>
        </div>
      </div>
      <Link to="/planning" className="flex items-center mb-4 text-sm">
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to planning</span>
      </Link>
    </div>
  );
};

export default PageHeader;
