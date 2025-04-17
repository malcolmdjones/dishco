
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Calendar, Search, ShoppingCart, MoreHorizontal, FolderOpen } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home
    },
    {
      name: 'Planning',
      path: '/planning',
      icon: Calendar
    },
    {
      name: 'Explore',
      path: '/explore',
      icon: Search
    },
    {
      name: 'Grocery',
      path: '/grocery',
      icon: ShoppingCart
    },
    {
      name: 'More',
      path: '/more',
      icon: MoreHorizontal
    }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden">
      <ul className="flex justify-between">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={cn(
                "flex flex-col items-center text-gray-500 hover:text-dishco-primary",
                currentPath === item.path && "text-dishco-primary"
              )}
            >
              {React.createElement(item.icon, { className: "h-6 w-6 mb-1" })}
              <span className="text-xs">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
