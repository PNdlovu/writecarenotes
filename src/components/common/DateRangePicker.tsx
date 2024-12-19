import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  value: [Date | null, Date | null];
  onChange: (dates: [Date | null, Date | null]) => void;
  startLabel?: string;
  endLabel?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  startLabel = 'Start Date',
  endLabel = 'End Date',
}) => {
  const [startDate, endDate] = value;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {startLabel}
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => onChange([date, endDate])}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {endLabel}
        </label>
        <DatePicker
          selected={endDate}
          onChange={(date) => onChange([startDate, date])}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    </div>
  );
};


