import { ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/Card';
import { Row } from '@/components/Row';
import { mockPlaythroughs, mockScenarios } from '@/data/mockData';
import { colors } from '@/theme';

export default function ScenarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = mockScenarios.find((s) => s.id === id);
  const playthrough = mockPlaythroughs.find((p) => p.scenarioId === id);

  if (!scenario) {
    return <Text style={styles.empty}>Сценарий не найден</Text>;
  }

  const reached = playthrough?.stageIndex ?? 0;

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: scenario.title }} />
      <Text style={styles.description}>{scenario.description}</Text>
      <Card title="Этапы">
        {scenario.stages.map((stage, index) => (
          <Row
            key={stage.id}
            icon={index < reached ? '✅' : index === reached ? '📍' : '🔒'}
            title={index <= reached ? stage.title : `Этап ${index + 1}`}
            detail={`${stage.points} б.`}
          />
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  empty: { color: colors.secondaryText, textAlign: 'center', marginTop: 40 },
  description: { color: colors.text, fontSize: 17, marginHorizontal: 32, marginBottom: 20 },
});
