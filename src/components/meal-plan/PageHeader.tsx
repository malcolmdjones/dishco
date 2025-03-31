
import React from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeaderContent from './PageHeaderContent';

interface PageHeaderProps {
  onOpenVault?: () => void;
  onOpenWeekOverview?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  onOpenVault, 
  onOpenWeekOverview 
}) => {
  return (
    <PageHeaderContent 
      onOpenVault={onOpenVault || (() => {})} 
      onOpenWeekOverview={onOpenWeekOverview || (() => {})} 
    />
  );
};

export default PageHeader;
