import React from 'react';
import { Input, InputProps } from '@chakra-ui/react';

interface TimeInputProps extends Omit<InputProps, 'type'> {
  value?: string;
  onChange?: (value: string) => void;
}

export const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
};


