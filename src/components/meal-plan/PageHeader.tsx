
import React from 'react';
import PageHeaderContent from './PageHeaderContent';

interface PageHeaderProps {
  onOpenVault: () => void;
  onOpenWeekOverview: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onOpenVault, onOpenWeekOverview }) => {
  return (
    <div>
      <PageHeaderContent 
        onOpenVault={onOpenVault} 
        onOpenWeekOverview={onOpenWeekOverview} 
      />
    </div>
  );
};

export default PageHeader;
