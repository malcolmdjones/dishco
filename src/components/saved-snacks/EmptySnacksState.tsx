
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Cookie } from 'lucide-react';

interface EmptySnacksStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const EmptySnacksState: React.FC<EmptySnacksStateProps> = ({
  title = "No saved snacks found",
  description = "Browse the snack collection to add some favorites.",
  icon = <Cookie size={48} className="text-dishco-primary mx-auto" />,
  children
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1">{description}</p>
      {children}
    </div>
  );
};

export default EmptySnacksState;
