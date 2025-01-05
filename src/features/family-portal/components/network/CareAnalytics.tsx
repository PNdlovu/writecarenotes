import React from 'react';
import { Card } from "@/components/ui/Card/Card";
import { Progress } from "@/components/ui/Progress/Progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";

interface CareAnalyticsProps {
  residentId: string;
}

export const CareAnalytics: React.FC<CareAnalyticsProps> = ({
  residentId,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Care Analytics Dashboard</h3>
        <Select defaultValue="THIS_MONTH">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="THIS_WEEK">This Week</SelectItem>
            <SelectItem value="THIS_MONTH">This Month</SelectItem>
            <SelectItem value="LAST_3_MONTHS">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-4">Task Completion Rate</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Morning Care</span>
                <span>85%</span>
              </div>
              <Progress value={85} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Medication</span>
                <span>92%</span>
              </div>
              <Progress value={92} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Activities</span>
                <span>78%</span>
              </div>
              <Progress value={78} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Family Participation</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Task Assignments</span>
                <span>15 tasks</span>
              </div>
              <Progress value={75} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Video Calls</span>
                <span>8 calls</span>
              </div>
              <Progress value={80} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Journal Entries</span>
                <span>12 entries</span>
              </div>
              <Progress value={60} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Response Time</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Emergency</span>
                <span>5 min avg</span>
              </div>
              <Progress value={95} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Regular Tasks</span>
                <span>2.5 hrs avg</span>
              </div>
              <Progress value={85} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Care Quality Indicators</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Wellness Goals</span>
                <span>4/5 achieved</span>
              </div>
              <Progress value={80} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Medical Adherence</span>
                <span>95%</span>
              </div>
              <Progress value={95} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


