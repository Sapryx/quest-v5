import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { scanFromURLAsync } from 'expo-camera';
import { MockTag, mockTags } from '@/data/mockTags';
import { colors } from '@/theme';

type Props = { onScanned: (code: string) => void };

export function MockScanner({ onScanned }: Props) {
  const [error, setError] = useState<string>();

  const scan = async (tag: MockTag) => {
    const asset = await Asset.fromModule(tag.image).downloadAsync();
    const [result] = await scanFromURLAsync(asset.localUri ?? asset.uri, ['qr']);
    if (result) onScanned(result.data);
    else setError('QR-код на изображении не распознан');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Камера недоступна: выберите снимок метки</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        {mockTags.map((tag) => (
          <Pressable key={tag.label} onPress={() => scan(tag)} style={({ pressed }) => [styles.tag, pressed && styles.pressed]}>
            <Image source={tag.image} style={styles.image} />
            <Text style={styles.label}>{tag.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { alignSelf: 'stretch', backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  title: { color: colors.secondaryText, fontSize: 15, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 15, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tag: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 10, alignItems: 'center', gap: 6 },
  pressed: { opacity: 0.6 },
  image: { width: '100%', aspectRatio: 1 },
  label: { color: colors.text, fontSize: 13, textAlign: 'center' },
});
