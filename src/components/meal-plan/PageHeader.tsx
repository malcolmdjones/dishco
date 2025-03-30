
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeaderContent from './PageHeaderContent';

interface PageHeaderProps {
  onOpenVault: () => void;
  onOpenWeekOverview: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onOpenVault, onOpenWeekOverview }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Link to="/planning" className="flex items-center">
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">Back</span>
        </Link>
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
      
      <PageHeaderContent />
    </div>
  );
};

export default PageHeader;
