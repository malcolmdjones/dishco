
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const absDifference = Math.abs(dailyDifference);
  
  // Estimate weight change per week (3500 kcal ≈ 1 lb)
  const weightChangePerWeek = Math.abs(dailyDifference * 7 / 3500).toFixed(1);
  
  // Chart config
  const chartConfig = {
    calories: {
      label: "Calories",
      color: "#F97316"
    },
    target: {
      label: "Target",
      color: "#9b87f5"
    }
  };

  const formatDay = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEE');
  };

  return (
    <Card className="mb-6 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <span>Caloric Balance Overview</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <p className="text-sm text-muted-foreground">How am I doing with my calories this week?</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold mb-2">
            {averageCalories} <span className="text-sm font-normal text-muted-foreground">kcal avg/day</span>
          </div>
          
          <div className={cn(
            "flex items-center text-sm mb-2 font-medium",
            isDeficit ? "text-green-500" : isSurplus ? "text-amber-500" : "text-blue-500"
          )}>
            {isDeficit ? (
              <ArrowDown className="mr-1 h-4 w-4" />
            ) : isSurplus ? (
              <ArrowUp className="mr-1 h-4 w-4" />
            ) : null}
            <span>
              {isDeficit ? "Deficit" : isSurplus ? "Surplus" : "On target"} of {absDifference} kcal/day
            </span>
          </div>
          
          {(isDeficit || isSurplus) && (
            <p className="text-sm text-muted-foreground mb-4">
              {isDeficit ? (
                <>You're averaging a {absDifference} kcal deficit/day — keep this up for ~{weightChangePerWeek} lb loss/week.</>
              ) : (
                <>You're averaging a {absDifference} kcal surplus/day — this equals ~{weightChangePerWeek} lb gain/week.</>
              )}
            </p>
          )}
        </div>
        
        <div className="h-64">
          <ChartContainer config={chartConfig} className="h-full">
            <AreaChart data={weeklyData} margin={{ top: 5, right: 0, left: 0, bottom: 16 }}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date"
                tickFormatter={formatDay}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                dy={10}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  
                  const data = payload[0].payload;
                  return (
                    <ChartTooltipContent>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">{formatDay(data.date)}</p>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Calories:</span>
                          <span className="font-medium">{data.calories}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Target:</span>
                          <span className="font-medium">{data.target}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Difference:</span>
                          <span className={cn(
                            "font-medium",
                            data.calories < data.target ? "text-green-500" : "text-amber-500"
                          )}>
                            {data.calories - data.target}
                          </span>
                        </div>
                      </div>
                    </ChartTooltipContent>
                  );
                }}
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#9b87f5" 
                strokeWidth={2}
                fill="none" 
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="#F97316" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCalories)"
                dot={{
                  stroke: '#F97316',
                  strokeWidth: 2,
                  r: 4,
                  fill: 'white'
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        
        {missingLogDays > 0 && (
          <div className="px-6 py-3 bg-amber-50 text-amber-700 text-sm border-t border-amber-100">
            <strong>Note:</strong> You're missing logs for {missingLogDays} {missingLogDays === 1 ? 'day' : 'days'} this week. 
            This may affect your averages.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaloricBalanceOverview;
