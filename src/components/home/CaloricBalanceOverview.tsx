
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface CaloricBalanceOverviewProps {
  weeklyData: {
    date: string;
    calories: number | null;
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
  
  const weightChangePerWeek = Math.abs(dailyDifference * 7 / 3500).toFixed(1);
  
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate dynamic Y-axis domain based on data and target
  const allValues = weeklyData
    .map(item => item.calories)
    .filter(value => value !== null) as number[];
  
  const minDataValue = Math.min(...(allValues.length > 0 ? allValues : [0]), targetCalories * 0.7);
  const maxDataValue = Math.max(...(allValues.length > 0 ? allValues : [0]), targetCalories * 1.3);
  
  // Ensure there's always at least 30% padding around the target line
  const yAxisMin = Math.floor(Math.min(minDataValue, targetCalories) * 0.9);
  const yAxisMax = Math.ceil(Math.max(maxDataValue, targetCalories) * 1.1);
  
  const formatXAxis = (dateStr: string) => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convert to 0 = Monday, 6 = Sunday
    return dayAbbreviations[dayIndex];
  };

  // Custom formatter for Y-axis to show the target calories value
  const formatYAxis = (value: number) => {
    // Show the actual value for the target calories and round other values
    if (Math.abs(value - targetCalories) < 5) {
      return `${targetCalories} cal`;
    }
    return Math.round(value).toString();
  };

  return (
    <Card 
      className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF9966] to-[#FF5733] text-white shadow-lg cursor-pointer"
      onClick={() => navigate('/nutrition')}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Average Daily Calories – Last 7 Days</h3>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <ChevronRight className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <div className="flex items-baseline">
          <div className="text-3xl font-bold">{averageCalories}</div>
          <span className="ml-1 text-sm font-normal opacity-80">cal</span>
        </div>
        
        <div className="mb-1 flex items-center text-sm">
          {isDeficit ? (
            <>
              <ArrowDown className="mr-1 h-4 w-4" />
              <span>
                {Math.abs(dailyDifference)} deficit · ~{weightChangePerWeek}lb/week
              </span>
            </>
          ) : isSurplus ? (
            <>
              <ArrowUp className="mr-1 h-4 w-4" />
              <span>
                {dailyDifference} surplus · ~{weightChangePerWeek}lb/week
              </span>
            </>
          ) : (
            <span>On target</span>
          )}
        </div>
        
        <div className="h-28 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={weeklyData} 
              margin={{ top: 5, right: 30, left: 45, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" vertical={false} />
              <XAxis 
                dataKey="date"
                tickFormatter={formatXAxis}
                axisLine={{ stroke: '#ffffff33' }}
                tickLine={false}
                tick={{ fill: 'white', fontSize: 12 }}
                dy={5}
              />
              <YAxis 
                domain={[yAxisMin, yAxisMax]}
                tickFormatter={formatYAxis}
                axisLine={{ stroke: '#ffffff33' }}
                tickLine={false}
                tick={{ fill: 'white', fontSize: 12 }}
                width={70}
              />
              <ReferenceLine 
                y={targetCalories} 
                stroke="#ffffff" 
                strokeWidth={1.5} 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Goal', 
                  position: 'insideTopRight', 
                  fill: 'white', 
                  fontSize: 10,
                  opacity: 0.7,
                  offset: -10
                }} 
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ r: 4, fill: "#FF5733", stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#ffffff", stroke: "#FF5733" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {missingLogDays > 0 && (
          <div className="mt-1 rounded-lg bg-white/10 px-3 py-2 text-xs">
            <strong>Note:</strong> Add entries for {missingLogDays} missing {missingLogDays === 1 ? 'day' : 'days'} to get a more accurate trend.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaloricBalanceOverview;
