"use client";

import { ChartData } from "@/lib/api/reports";

interface CustomerChartProps {
  data: ChartData;
}

export function CustomerChart({ data }: CustomerChartProps) {
  // Simple chart implementation using CSS and HTML
  // In a real app, you'd use a charting library like Chart.js, Recharts, or D3.js
  
  const maxValue = Math.max(...data.datasets[0].data);
  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
  
  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-64 flex items-end justify-between gap-2">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const height = (value / maxValue) * 100;
          const color = data.datasets[0].backgroundColor || "rgba(139, 92, 246, 0.8)";
          
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className="text-xs text-muted-foreground mb-2">
                {value.toLocaleString()}
              </div>
              <div
                className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor: color,
                  minHeight: "4px",
                }}
                title={`${label}: ${value.toLocaleString()}`}
              />
              <div className="text-xs text-muted-foreground mt-2 text-center">
                {label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-2">
        <div 
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: data.datasets[0].backgroundColor }}
        />
        <span className="text-sm text-muted-foreground">
          {data.datasets[0].label}
        </span>
      </div>
      
      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Total: {total.toLocaleString()}
      </div>
    </div>
  );
}
