import React from 'react';
import { Progress, XStack, YStack } from 'tamagui';

interface CustomProgressBarProps {
  progress: number; // 0 to 1
  color: string;
  unfilledColor: string;
  height?: number;
  borderRadius?: number;
}

export function CustomProgressBar({ progress, color, unfilledColor, height = 10, borderRadius = 5 }: CustomProgressBarProps) {
  const percentage = progress * 100;

  return (
    <Progress
      value={percentage}
      max={100}
      height={height}
      borderRadius={borderRadius}
      backgroundColor={unfilledColor}
      overflow="hidden"
    >
      <Progress.Indicator animation="bouncy" backgroundColor={color} />
    </Progress>
  );
}