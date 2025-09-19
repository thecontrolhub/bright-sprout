import { Button, styled } from 'tamagui';

export const StyledButton = styled(Button, {
  name: 'StyledButton',
  fontFamily: '$body',
  fontWeight: 'bold',
  size: '$4',
  width: '100%',
});

export const PrimaryButton = styled(StyledButton, {
  name: 'PrimaryButton',
 
  color: '$color',
  pressTheme: true,
});

export const GhostButton = styled(StyledButton, {
  name: 'GhostButton',
  chromeless: true,
});

export const DestructiveButton = styled(StyledButton, {
  name: 'DestructiveButton',
  color: '$color',
  pressTheme: true,
});