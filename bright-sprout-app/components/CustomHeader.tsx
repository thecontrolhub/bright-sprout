import React from 'react';
import { YStack, XStack, H3, Image } from 'tamagui';

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
          onPress={() => {
            console.log("Logo pressed in CustomHeader!");
            onMenuPress?.();
          }}
        />
      </XStack>
    </XStack>
  );
}