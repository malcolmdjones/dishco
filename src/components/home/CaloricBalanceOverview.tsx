
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, XAxis } from 'recharts';
import { ArrowDown, ArrowRight, ArrowUp, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface CaloricBalanceOverviewProps {
  weeklyData: {
    date: string;
    calories: number;
    target: number;
  }[];
  averageCalories: number;
  targetCalories: number;
  missingLogDays: number;
}

const CaloricBalanceOverview: React.FC<CaloricBalanceOverviewProps> = ({
  weeklyData,
  averageCalories,
  targetCalories,
  missingLogDays
}) => {
  const navigate = useNavigate();
  const dailyDifference = averageCalories - targetCalories;
  const isDeficit = dailyDifference < 0;
  const isSurplus = dailyDifference > 0;
  
  // Estimate weight change per week (3500 kcal ≈ 1 lb)
  const weightChangePerWeek = Math.abs(dailyDifference * 7 / 3500).toFixed(1);
  
  const formatDay = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEE');
  };

  return (
    <Card 
      className="mb-6 overflow-hidden rounded-3xl bg-[#FF5733] text-white shadow-lg cursor-pointer"
      onClick={() => navigate('/nutrition')} // Navigate to a nutrition details page (you'll need to create this)
    >
      <CardContent className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-medium">Caloric Balance</h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <ChevronRight className="h-5 w-5 text-white" />
          </div>
        </div>
        
        <div className="mb-1">
          <div className="text-sm opacity-80">Average daily calories</div>
          <div className="text-5xl font-bold">{averageCalories} <span className="text-2xl font-normal opacity-80">cal</span></div>
          
          <div className="mt-1 flex items-center">
            {isDeficit ? (
              <>
                <ArrowDown className="mr-1 h-4 w-4" />
                <span className="font-medium">
                  Deficit of {Math.abs(dailyDifference)} kcal/day
                </span>
              </>
            ) : isSurplus ? (
              <>
                <ArrowUp className="mr-1 h-4 w-4" />
                <span className="font-medium">
                  Surplus of {dailyDifference} kcal/day
                </span>
              </>
            ) : (
              <span className="font-medium">On target</span>
            )}
          </div>
        </div>
        
        {(isDeficit || isSurplus) && (
          <div className="mb-3 text-sm opacity-90">
            {isDeficit ? (
              <>You're averaging a {Math.abs(dailyDifference)} kcal deficit/day — keep this up for ~{weightChangePerWeek} lb loss/week.</>
            ) : (
              <>You're averaging a {dailyDifference} kcal surplus/day — this could lead to ~{weightChangePerWeek} lb gain/week.</>
            )}
          </div>
        )}
        
        <div className="h-32 px-0 mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={weeklyData} 
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date"
                tickFormatter={formatDay}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'white', fontSize: 12 }}
                dy={10}
              />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="#FFFFFF" 
                strokeWidth={2}
                fillOpacity={0.2} 
                fill="url(#colorCalories)"
                dot={false}
                activeDot={{ r: 4, fill: "#FFFFFF", stroke: "#FF5733" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {missingLogDays > 0 && (
          <div className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <strong>Note:</strong> You're missing logs for {missingLogDays} {missingLogDays === 1 ? 'day' : 'days'} this week. 
            Adding these logs will give you a more accurate average.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaloricBalanceOverview;
