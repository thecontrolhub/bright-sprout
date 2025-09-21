import { Input, styled, InputProps } from 'tamagui';

export const StyledInput = styled(Input, {
  name: 'StyledInput',
  size: '$4',
  width: '100%',
  marginVertical: '$2',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  backgroundColor: '$background',
  placeholderTextColor: '$color',
  fontFamily: '$body',

  variants: {
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  },
});
