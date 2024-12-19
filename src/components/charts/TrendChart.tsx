import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface TrendData {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  color?: string;
  valueName?: string;
}

export function TrendChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  className,
  color = "#8884d8",
  valueName = "Value",
}: TrendChartProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div role="img" aria-label={title || "Trend chart"} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
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
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                name={valueName}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


