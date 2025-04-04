
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmptySnacksState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
          <path d="M3 11V3h8M21 13v8h-8M11 3h8v8M13 21H3v-8"/>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">No saved snacks found</h3>
      <p className="text-gray-500 mt-1">Browse the snack collection to add some favorites.</p>
      <Button 
        className="mt-4"
        onClick={() => navigate('/explore-snacks')}
      >
        Explore Snacks
      </Button>
    </div>
  );
};

export default EmptySnacksState;
