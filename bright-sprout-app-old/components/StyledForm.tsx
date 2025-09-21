import { YStack, YStackProps } from 'tamagui';

interface StyledFormProps extends YStackProps {
  children: React.ReactNode;
}

export function StyledForm({ children, ...rest }: StyledFormProps) {
  return (
    <YStack
      overflow="hidden"
      maxWidth={400}
      space="$4"
      {...rest}
    >
      {children}
    </YStack>
  );
}
