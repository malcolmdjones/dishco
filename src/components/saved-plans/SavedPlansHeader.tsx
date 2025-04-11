
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface SavedPlansHeaderProps {
  title: string;
  subtitle?: string;
}

const SavedPlansHeader: React.FC<SavedPlansHeaderProps> = ({ 
  title, 
  subtitle = "Access and manage your saved meal plans"
}) => {
  return (
    <header className="mb-6 flex items-center">
      <Link to="/more" className="mr-3">
        <ArrowLeft size={20} />
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-dishco-text-light">{subtitle}</p>
      </div>
    </header>
  );
};

export default SavedPlansHeader;
