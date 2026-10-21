import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(Math.max(value, 0), 1) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: colors.fill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
});
