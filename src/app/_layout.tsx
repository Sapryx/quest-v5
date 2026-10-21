import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useQuestStore } from '@/store/questStore';

export default function RootLayout() {
  const start = useQuestStore((s) => s.start);

  useEffect(() => {
    start();
  }, [start]);

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Квесты', headerLargeTitleEnabled: true }} />
      <Stack.Screen name="scenario/[id]" options={{ title: 'Сценарий' }} />
      <Stack.Screen name="play/[id]" options={{ title: 'Этап' }} />
      <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
