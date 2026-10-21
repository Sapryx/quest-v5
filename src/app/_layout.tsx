import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Квесты', headerLargeTitleEnabled: true }} />
      <Stack.Screen name="scenario/[id]" options={{ title: 'Сценарий' }} />
    </Stack>
  );
}
