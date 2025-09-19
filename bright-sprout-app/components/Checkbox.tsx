import { Checkbox, styled } from 'tamagui';

const StyledCheckboxFrame = styled(Checkbox, {
  name: 'StyledCheckbox',
  size: '$4',
});

export const StyledCheckbox = Object.assign(StyledCheckboxFrame, {
  // By using Object.assign, we copy the static properties from the original
  // Checkbox component, like `Indicator`, to our new styled component.
  Indicator: Checkbox.Indicator,
});