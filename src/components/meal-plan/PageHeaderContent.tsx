
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
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/planning')} 
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">New Meal Plan</h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="px-6 rounded-full"
              onClick={onOpenWeekOverview}
            >
              Overview
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full aspect-square w-[48px] h-[48px]"
              onClick={onOpenVault}
            >
              <BookOpen size={20} />
            </Button>
          </div>
        </div>
        <p className="text-gray-500 text-lg mt-1 ml-10">Plan and customize your meals</p>
      </div>
    </>
  );
};

export default PageHeaderContent;
