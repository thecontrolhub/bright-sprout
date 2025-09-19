import { H1, H3, Paragraph, styled } from 'tamagui';

export const Title = styled(H1, {
  name: 'Title',
  fontFamily: '$heading',
  color: '$green10',
});

export const Subtitle = styled(H3, {
  name: 'Subtitle',
  fontFamily: '$heading',
  color: '$color',
});

export const BodyText = styled(Paragraph, {
  name: 'BodyText',
  fontFamily: '$body',
  color: '$color',
});