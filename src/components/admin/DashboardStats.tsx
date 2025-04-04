
import React from 'react';
import { Users, BarChart2, Settings } from 'lucide-react';

interface DashboardStatsProps {
  userCount: number;
  planCount: number;
  recipeCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  userCount,
  planCount,
  recipeCount
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm text-center">
        <Users className="mx-auto mb-2 text-blue-500" />
        <h3 className="text-2xl font-bold">{userCount}</h3>
        <p className="text-sm text-dishco-text-light">Total Users</p>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm text-center">
        <BarChart2 className="mx-auto mb-2 text-green-500" />
        <h3 className="text-2xl font-bold">{planCount}</h3>
        <p className="text-sm text-dishco-text-light">Meal Plans</p>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm text-center">
        <Settings className="mx-auto mb-2 text-purple-500" />
        <h3 className="text-2xl font-bold">{recipeCount}</h3>
        <p className="text-sm text-dishco-text-light">Recipes</p>
      </div>
    </div>
  );
};

export default DashboardStats;
