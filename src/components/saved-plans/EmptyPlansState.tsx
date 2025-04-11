
import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyPlansState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-dishco-text-light">
      <Calendar size={48} className="mb-4" />
      <p className="mb-4">No saved meal plans yet.</p>
      <Link to="/planning" className="text-dishco-primary">
        Create your first meal plan
      </Link>
    </div>
  );
};

export default EmptyPlansState;
