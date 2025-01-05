import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ComparisonData {
  name: string;
  current: number;
  previous: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  periodLabel?: {
    current: string;
    previous: string;
  };
}

export function ComparisonChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  className,
  periodLabel = {
    current: "Current Period",
    previous: "Previous Period",
  },
}: ComparisonChartProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div role="img" aria-label={title || "Comparison chart"} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                label={
                  xAxisLabel
                    ? { value: xAxisLabel, position: "bottom", offset: 15 }
                    : undefined
                }
              />
              <YAxis
                label={
                  yAxisLabel
                    ? {
                        value: yAxisLabel,
                        angle: -90,
                        position: "insideLeft",
                        offset: 0,
                      }
                    : undefined
                }
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="current"
                fill="#8884d8"
                name={periodLabel.current}
              />
              <Bar
                dataKey="previous"
                fill="#82ca9d"
                name={periodLabel.previous}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


