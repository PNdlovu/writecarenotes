import React, { useRef, useEffect, useState } from 'react';
import { Box, Text, Button, Group, Stack } from '@mantine/core';
import SignaturePadLib from 'signature_pad';

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);

    // Initialize signature pad
    padRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
    });

    // Load existing signature if any
    if (value) {
      padRef.current.fromDataURL(value);
      setIsEmpty(false);
    }

    // Handle window resize
    const handleResize = () => {
      const data = padRef.current?.toData();
      if (!canvas) return;

      canvas.width = canvas.offsetWidth * scale;
      canvas.height = height * scale;
      context.scale(scale, scale);
      
      if (data) {
        padRef.current?.fromData(data);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  // Update signature data when pad changes
  useEffect(() => {
    if (!padRef.current) return;

    const handleEnd = () => {
      if (!padRef.current) return;
      setIsEmpty(padRef.current.isEmpty());
      onChange(padRef.current.toDataURL());
    };

    padRef.current.addEventListener('endStroke', handleEnd);
    return () => padRef.current?.removeEventListener('endStroke', handleEnd);
  }, [onChange]);

  const handleClear = () => {
    if (!padRef.current) return;
    padRef.current.clear();
    setIsEmpty(true);
    onChange('');
  };

  return (
    <Stack spacing="sm">
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.colors.gray[3]}`,
          borderRadius: theme.radius.sm,
          backgroundColor: 'white',
        })}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: `${height}px`,
            touchAction: 'none',
          }}
        />
      </Box>
      <Group position="apart">
        <Text size="sm" color="dimmed">
          {isEmpty ? 'Please sign above' : 'Signature captured'}
        </Text>
        <Button
          variant="subtle"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty}
        >
          Clear
        </Button>
      </Group>
    </Stack>
  );
};


