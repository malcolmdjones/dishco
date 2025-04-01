
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Calendar, MoreHorizontal, Plus } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      name: 'Home',
      icon: <Home size={24} />,
      path: '/',
    },
    {
      name: 'Planning',
      icon: <Calendar size={24} />,
      path: '/planning',
    },
    {
      name: 'Log Meal',
      icon: <Plus size={24} className="text-white" />,
      path: '/log-meal',
      isCenter: true,
    },
    {
      name: 'Grocery',
      icon: <ShoppingCart size={24} />,
      path: '/grocery',
    },
    {
      name: 'More',
      icon: <MoreHorizontal size={24} />,
      path: '/more',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center ${
              currentPath === item.path ? 'text-dishco-primary' : 'text-gray-500'
            }`}
          >
            {item.isCenter ? (
              <div className="relative -top-5">
                <div className="w-14 h-14 bg-green-500 hover:bg-green-600 transition-colors rounded-full flex items-center justify-center shadow-lg">
                  {item.icon}
                </div>
                <span className="text-xs mt-1 text-green-500 font-medium">{item.name}</span>
              </div>
            ) : (
              <>
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
