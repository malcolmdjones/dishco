
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface SavedPlansHeaderProps {
  title: string;
  subtitle?: string;
}

const SavedPlansHeader: React.FC<SavedPlansHeaderProps> = ({ 
  title, 
  subtitle = "Your collection of meal plans"
}) => {
  return (
    <header className="mb-6">
      <div className="flex items-center mb-1">
        <Link to="/more" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <p className="text-gray-600">{subtitle}</p>
    </header>
  );
};

export default SavedPlansHeader;
