import { ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Row } from '@/components/Row';
import { colors } from '@/theme';
import { confirmAction } from '@/utils/dialogs';
import { formatDateTime, formatDuration } from '@/utils/format';
import { StageState, useScenarioViewModel } from '@/viewmodels/useScenarioViewModel';

const stageIcons: Record<StageState, string> = { done: '✅', current: '📍', locked: '🔒' };

export default function ScenarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useScenarioViewModel(id);

  if (!vm.scenario) {
    return <Text style={styles.empty}>Сценарий не найден</Text>;
  }

  const play = (playthroughId: number) => router.push(`/play/${playthroughId}`);

  const start = async () => {
    if (
      vm.activePlaythroughId !== undefined &&
      !(await confirmAction('Начать заново?', 'Текущий прогресс по сценарию будет сброшен.', 'Начать заново'))
    ) {
      return;
    }
    play(await vm.start());
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: vm.scenario.title }} />
      <Text style={styles.icon}>{vm.scenario.icon}</Text>
      <Text style={styles.description}>{vm.scenario.description}</Text>

      {vm.activePlaythroughId !== undefined ? (
        <Button title="Продолжить" primary onPress={() => play(vm.activePlaythroughId!)} />
      ) : null}
      <Button title={vm.activePlaythroughId !== undefined ? 'Начать заново' : 'Начать квест'} primary={vm.activePlaythroughId === undefined} onPress={start} />

      <Card title={`Этапы · максимум ${vm.maxScore} б.`}>
        {vm.stages.map(({ stage, index, state }) => (
          <Row
            key={stage.id}
            icon={stageIcons[state]}
            title={state === 'locked' ? `Этап ${index + 1}` : stage.title}
            detail={`${stage.points} б.`}
          />
        ))}
      </Card>

      {vm.history.length > 0 ? (
        <Card title="История прохождений">
          {vm.history.map((attempt) => (
            <Row
              key={attempt.id}
              icon="🏁"
              title={`${attempt.score} баллов`}
              subtitle={`${formatDateTime(attempt.finishedAt)} · за ${formatDuration(attempt.duration)}`}
            />
          ))}
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  empty: { color: colors.secondaryText, textAlign: 'center', marginTop: 40 },
  icon: { fontSize: 56, textAlign: 'center' },
  description: { color: colors.text, fontSize: 17, textAlign: 'center', marginHorizontal: 32, marginVertical: 16 },
});
