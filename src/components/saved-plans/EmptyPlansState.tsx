
import React from 'react';
import { Calendar } from 'lucide-react';

const EmptyPlansState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-dishco-text-light">
      <Calendar size={48} className="mb-4" />
      <p>No saved meal plans yet.</p>
    </div>
  );
};

export default EmptyPlansState;
