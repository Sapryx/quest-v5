import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import { ProgressBar } from './ProgressBar';

type Props = {
  icon: string;
  title: string;
  status: string;
  progress: number;
  onPress: () => void;
};

export function ScenarioRow({ icon, title, status, progress, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.status}>{status}</Text>
        <ProgressBar value={progress} />
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  pressed: { backgroundColor: colors.fill },
  icon: { fontSize: 32, marginRight: 12 },
  body: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 17, fontWeight: '600' },
  status: { color: colors.secondaryText, fontSize: 13, marginBottom: 4 },
  chevron: { color: colors.secondaryText, fontSize: 22, marginLeft: 8 },
});
