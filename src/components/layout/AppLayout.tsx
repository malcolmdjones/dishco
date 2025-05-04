import React from 'react';
import TopNavigation from './TopNavigation';
import BottomNavigation from './BottomNavigation';
import { Outlet } from 'react-router-dom';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <TopNavigation />
        <div className="pb-20 px-4">
          <Outlet />
          {children}
        </div>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default AppLayout;
