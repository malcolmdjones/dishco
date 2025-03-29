
import React from 'react';
import BottomNavigation from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-dishco-background">
      <main className="flex-1 pb-16 pt-4 px-4 max-w-md mx-auto w-full">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
