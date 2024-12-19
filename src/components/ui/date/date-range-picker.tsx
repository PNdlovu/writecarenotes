'use client';

import { Calendar } from '../calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Button } from '../button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from "lucide-react"
import format from "date-fns/format"
import { useState } from 'react';

interface DateRangePickerProps {
  from?: Date | null;
  to?: Date | null;
  onSelect: (range: { from: Date; to: Date } | undefined) => void;
}

export function DateRangePicker({ from, to, onSelect }: DateRangePickerProps) {
  const [date, setDate] = useState<{ from: Date; to: Date }>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}


