import { ColorValue, Platform, PlatformColor } from 'react-native';

const color = (ios: string, other: string): ColorValue => (Platform.OS === 'ios' ? PlatformColor(ios) : other);

export const colors = {
  background: color('systemGroupedBackground', '#F2F2F7'),
  card: color('secondarySystemGroupedBackground', '#FFFFFF'),
  text: color('label', '#000000'),
  secondaryText: color('secondaryLabel', '#3C3C4399'),
  separator: color('separator', '#3C3C434A'),
  accent: color('systemBlue', '#007AFF'),
  danger: color('systemRed', '#FF3B30'),
  success: color('systemGreen', '#34C759'),
  fill: color('tertiarySystemFill', '#7676801F'),
};
