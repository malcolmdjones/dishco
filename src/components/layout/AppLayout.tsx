
import React from 'react';
import BottomNavigation from './BottomNavigation';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col min-h-screen bg-dishco-background">
        <main className="flex-1 pb-20 pt-4 px-4 max-w-md mx-auto w-full">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </TooltipProvider>
  );
};

export default AppLayout;
