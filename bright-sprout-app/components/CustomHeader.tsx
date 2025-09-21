import React from 'react';
import { YStack, XStack, H3, Image, Button } from 'tamagui';

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
        <Button chromeless onPress={onMenuPress}>
          <Image
            source={require('../assets/images/logo.png')} // Corrected path
            width={40}
            height={40}
          />
        </Button>
      </XStack>
    </XStack>
  );
}
