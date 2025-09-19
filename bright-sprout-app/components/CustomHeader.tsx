import React from 'react';
import { YStack, XStack, H3, Image } from 'tamagui';
import { Menu } from '@tamagui/lucide-icons';

interface CustomHeaderProps {
  onMenuPress?: () => void;
}

export function CustomHeader({ onMenuPress }: CustomHeaderProps) {
  return (
    <XStack
      backgroundColor="$background"
      padding="$4"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <XStack alignItems="center" space="$2">
        {/* Placeholder for logo */}
        <Image
          source={require('../assets/images/logo.png')} // Assuming logo.png exists in assets/images
          width={40}
          height={40}
        />
        
      </XStack>
      {onMenuPress && <Menu size={24} color="$color" onPress={onMenuPress} />}
    </XStack>
  );
}
