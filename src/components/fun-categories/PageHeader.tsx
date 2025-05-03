
import React from 'react';
import { Search } from 'lucide-react';

const PageHeader: React.FC = () => {
  return (
    <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-2 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <button className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
          <Search size={20} />
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
