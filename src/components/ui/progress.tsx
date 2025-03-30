
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  type?: "linear" | "circular";
  value?: number;
  max?: number;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  status?: "default" | "success" | "warning" | "error";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  indicatorClassName, 
  type = "linear", 
  max = 100,
  showValue = false,
  valuePrefix = "",
  valueSuffix = "",
  label,
  size = "md",
  status = "default",
  ...props 
}, ref) => {
  const percentage = Math.min(100, (value / max) * 100);

  if (type === "circular") {
    // Calculate the circle parameters
    const radius = size === "sm" ? 24 : size === "md" ? 36 : 48;
    const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 6;
    const innerRadius = radius - strokeWidth;
    const circumference = 2 * Math.PI * innerRadius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // Calculate the status color class
    const statusColorClass = 
      status === "success" ? "text-green-500" : 
      status === "warning" ? "text-amber-500" : 
      status === "error" ? "text-red-500" : 
      "text-primary";
    
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div className="relative">
          <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={radius}
              cy={radius}
              r={innerRadius}
              fill="transparent"
              className="stroke-secondary"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={radius}
              cy={radius}
              r={innerRadius}
              fill="transparent"
              className={cn("transition-all duration-300 ease-in-out", statusColorClass, indicatorClassName)}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {showValue && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "font-medium",
                size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg",
                statusColorClass
              )}>
                {valuePrefix}{value}{valueSuffix}
              </span>
            </div>
          )}
        </div>
        {label && (
          <span className={cn(
            "mt-1 text-center", 
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
            "text-muted-foreground"
          )}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
