import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { Row } from '@/components/Row';
import { ScenarioRow } from '@/components/ScenarioRow';
import { mockCheckpoints, mockPlayer, mockPlaythroughs, mockScenarios } from '@/data/mockData';
import { colors } from '@/theme';
import { formatDateTime, formatDuration } from '@/utils/format';

export default function HomeScreen() {
  const totalScore = mockPlaythroughs.reduce((sum, p) => sum + p.score, 0);
  const completed = mockPlaythroughs.filter((p) => p.finishedAt !== null).length;
  const journal = [...mockCheckpoints].sort((a, b) => b.reachedAt - a.reachedAt);

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
      <Card title="Профиль">
        <Row icon="👤" title={mockPlayer.name} subtitle={`Баллы: ${totalScore} · Пройдено квестов: ${completed}`} />
      </Card>

      <Card title="Сценарии">
        {mockScenarios.map((scenario) => {
          const playthrough = mockPlaythroughs.find((p) => p.scenarioId === scenario.id);
          const status = playthrough
            ? `Этап ${playthrough.stageIndex + 1} из ${scenario.stages.length} · ${playthrough.score} баллов`
            : `Не начат · ${scenario.stages.length} этапа`;
          return (
            <ScenarioRow
              key={scenario.id}
              icon={scenario.icon}
              title={scenario.title}
              status={status}
              progress={playthrough ? playthrough.stageIndex / scenario.stages.length : 0}
              onPress={() => router.push(`/scenario/${scenario.id}`)}
            />
          );
        })}
      </Card>

      <Card title="Журнал прохождения">
        {journal.map((checkpoint) => {
          const playthrough = mockPlaythroughs.find((p) => p.id === checkpoint.playthroughId);
          const scenario = mockScenarios.find((s) => s.id === playthrough?.scenarioId);
          const stage = scenario?.stages.find((s) => s.id === checkpoint.stageId);
          const previous = mockCheckpoints
            .filter((c) => c.playthroughId === checkpoint.playthroughId && c.reachedAt < checkpoint.reachedAt)
            .reduce((latest, c) => Math.max(latest, c.reachedAt), playthrough?.startedAt ?? checkpoint.reachedAt);
          return (
            <Row
              key={checkpoint.id}
              icon="✅"
              title={stage?.title ?? checkpoint.stageId}
              subtitle={`${scenario?.title} · ${formatDateTime(checkpoint.reachedAt)} · за ${formatDuration(checkpoint.reachedAt - previous)}`}
              detail={`+${checkpoint.points}`}
            />
          );
        })}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
});
