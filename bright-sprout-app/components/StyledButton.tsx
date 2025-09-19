import { Button, styled, ButtonProps } from 'tamagui';

// Primary Button
export const PrimaryButton = styled(Button, {
  name: 'PrimaryButton',
  size: '$4',
  width: '100%',
  backgroundColor: '$primary',
  color: 'white',
  fontWeight: 'bold',
  fontFamily: '$body',
  marginVertical: '$2',
  borderRadius: '$4',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,

  variants: {
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  },
});

// Chromeless Button (for text links)
export const GhostButton = styled(Button, {
  name: 'GhostButton',
  chromeless: true,
  color: '$primary',
  fontWeight: 'bold',
  fontFamily: '$body',
  marginVertical: '$2',

  variants: {
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  },
});

// You can add more button types here if needed, e.g., SecondaryButton, OutlineButton
