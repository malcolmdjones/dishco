
import React from 'react';
import PageHeaderContent from './PageHeaderContent';

interface PageHeaderProps {
  onOpenVault: () => void;
  onOpenWeekOverview: () => void;
}

/**
 * Wrapper component for the page header content
 * This component follows the pass-through pattern to maintain compatibility
 */
const PageHeader: React.FC<PageHeaderProps> = (props) => {
  return <PageHeaderContent {...props} />;
};

export default PageHeader;
