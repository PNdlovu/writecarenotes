import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  colors?: string[];
}

export function BarChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  className,
  colors = ["#8884d8"],
}: BarChartProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div role="img" aria-label={title || "Bar chart"} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
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
              <Bar dataKey="value" fill={colors[0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


