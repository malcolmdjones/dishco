
import React from 'react';
import PageHeaderContent from './PageHeaderContent';

interface PageHeaderProps {
  onOpenVault: () => void;
  onOpenWeekOverview: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onOpenVault, onOpenWeekOverview }) => {
  return (
    <PageHeaderContent 
      onOpenVault={onOpenVault} 
      onOpenWeekOverview={onOpenWeekOverview} 
    />
  );
};

export default PageHeader;
