import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

type Props = { title: string; onPress: () => void; primary?: boolean };

export function Button({ title, onPress, primary }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, primary && styles.primary, pressed && styles.pressed]}
    >
      <Text style={[styles.text, primary && styles.primaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: 12, padding: 14 },
  primary: { backgroundColor: colors.accent },
  pressed: { opacity: 0.6 },
  text: { color: colors.accent, fontSize: 17, textAlign: 'center', fontWeight: '600' },
  primaryText: { color: 'white' },
});
