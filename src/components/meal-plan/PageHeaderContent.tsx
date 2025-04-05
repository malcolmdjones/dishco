
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderContentProps {
  title: string;
  showWeekViewButton?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onWeekViewClick?: () => void;
}

const PageHeaderContent: React.FC<PageHeaderContentProps> = ({ 
  title,
  showBackButton,
  showWeekViewButton,
  onBackClick,
  onWeekViewClick
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBackClick || (() => navigate('/planning'))} 
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex space-x-2">
          {showWeekViewButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onWeekViewClick}
              className="flex items-center gap-1"
            >
              <BookOpen size={16} />
              Overview
            </Button>
          )}
        </div>
      </div>
      <p className="text-dishco-text-light mb-4">Plan and customize your meals</p>
    </>
  );
};

export default PageHeaderContent;
