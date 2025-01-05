import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TimeDistribution } from "@/types/reports";

interface TimeDistributionChartProps {
  data: TimeDistribution[];
  title?: string;
  className?: string;
}

export function TimeDistributionChart({
  data,
  title = "Administrations by Time",
  className,
}: TimeDistributionChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Line chart showing medication administrations by time">
          <LineChart
            width={800}
            height={300}
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              label={{ value: "Hour of Day", position: "bottom" }}
            />
            <YAxis
              label={{
                value: "Number of Administrations",
                angle: -90,
                position: "left",
              }}
            />
            <Tooltip
              formatter={(value: number) => [
                `${value} administrations`,
                "Count",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Administrations"
            />
          </LineChart>
        </div>
      </CardContent>
    </Card>
  );
}


