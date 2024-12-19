import React from 'react';
import { Button } from "@/components/ui/Button";
import {
  CalendarDays
} from "lucide-react";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

interface DateRangePresetsProps {
  onSelect: (range: [Date, Date]) => void;
  className?: string;
}

export function DateRangePresets({ onSelect, className = '' }: DateRangePresetsProps) {
  const presets = [
    {
      label: "Today",
      getValue: () => [startOfDay(new Date()), endOfDay(new Date())],
    },
    {
      label: "Yesterday",
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return [startOfDay(yesterday), endOfDay(yesterday)];
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())],
    },
    {
      label: "Last 30 Days",
      getValue: () => [startOfDay(subDays(new Date(), 29)), endOfDay(new Date())],
    },
    {
      label: "This Week",
      getValue: () => [startOfWeek(new Date()), endOfWeek(new Date())],
    },
    {
      label: "This Month",
      getValue: () => [startOfMonth(new Date()), endOfMonth(new Date())],
    },
    {
      label: "This Year",
      getValue: () => [startOfYear(new Date()), endOfYear(new Date())],
    },
  ];

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          className="justify-start"
          onClick={() => onSelect(preset.getValue() as [Date, Date])}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {preset.label}
        </Button>
      ))}
    </div>
  );
}


