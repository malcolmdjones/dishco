
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Calendar, MoreHorizontal, PlusCircle } from 'lucide-react';

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
      icon: <PlusCircle size={30} className="text-dishco-primary" />,
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
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-item ${
              currentPath === item.path ? 'nav-item-active' : 'nav-item-inactive'
            } ${item.isCenter ? 'relative -top-4' : ''}`}
          >
            {item.icon}
            <span className={`text-xs mt-1 ${item.isCenter ? 'font-medium' : ''}`}>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
