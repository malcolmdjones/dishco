
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, XAxis } from 'recharts';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
  const dailyDifference = averageCalories - targetCalories;
  const isDeficit = dailyDifference < 0;
  const isSurplus = dailyDifference > 0;
  
  // Estimate weight change per week (3500 kcal ≈ 1 lb)
  const weightChangePerWeek = Math.abs(dailyDifference * 7 / 3500).toFixed(1);
  
  // Find the max value for better display
  const maxCalories = Math.max(...weeklyData.map(day => Math.max(day.calories || 0, day.target || 0)));
  
  // Find the day with highest calories for tooltip placement
  const highestDay = weeklyData.reduce((max, day) => 
    day.calories > (max?.calories || 0) ? day : max, 
    weeklyData[0]
  );
  
  const formatDay = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEE');
  };

  return (
    <Card className="mb-6 overflow-hidden rounded-3xl bg-[#FF5733] text-white shadow-lg">
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-medium">Caloric Balance</h3>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <ArrowRight className="h-5 w-5 text-white" />
          </div>
        </div>
        
        <div className="mb-2">
          <div className="text-sm opacity-80">Average daily calories</div>
          <div className="text-5xl font-bold">{averageCalories}</div>
          
          <div className="mt-2 flex items-center">
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
          <div className="mb-4 text-sm opacity-90">
            {isDeficit ? (
              <>You're averaging a {Math.abs(dailyDifference)} kcal deficit/day — keep this up for ~{weightChangePerWeek} lb loss/week.</>
            ) : (
              <>You're averaging a {dailyDifference} kcal surplus/day — this could lead to ~{weightChangePerWeek} lb gain/week.</>
            )}
          </div>
        )}
        
        <div className="h-40 px-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
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
                activeDot={{ r: 4, fill: "#FF5733", stroke: "#FFFFFF" }}
              />
              {highestDay && highestDay.calories > 0 && (
                <foreignObject 
                  x={(weeklyData.indexOf(highestDay) / weeklyData.length) * 100 + '%'} 
                  y="0" 
                  width="60" 
                  height="60"
                  style={{transform: 'translate(-30px, 0)'}}
                >
                  <div className="flex h-10 w-24 -translate-y-1/2 items-center justify-center rounded-full bg-white text-center text-sm font-semibold text-[#FF5733]">
                    {highestDay.calories}
                  </div>
                </foreignObject>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {missingLogDays > 0 && (
          <div className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm">
            <strong>Note:</strong> You're missing logs for {missingLogDays} {missingLogDays === 1 ? 'day' : 'days'} this week. 
            Adding these logs will give you a more accurate average.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaloricBalanceOverview;
