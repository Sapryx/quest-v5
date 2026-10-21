import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { Row } from '@/components/Row';
import { ScenarioRow } from '@/components/ScenarioRow';
import { colors } from '@/theme';
import { promptText } from '@/utils/dialogs';
import { formatDateTime, formatDuration } from '@/utils/format';
import { useHomeViewModel } from '@/viewmodels/useHomeViewModel';

export default function HomeScreen() {
  const vm = useHomeViewModel();

  const rename = async () => {
    const name = await promptText('Имя игрока', vm.player.name);
    if (name !== null) await vm.renamePlayer(name);
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
      {!vm.loaded ? <ActivityIndicator style={styles.loader} /> : null}

      <Card title="Профиль">
        <Row
          icon="👤"
          title={vm.player.name}
          subtitle={`Баллы: ${vm.totalScore} · Пройдено квестов: ${vm.completedCount}`}
          detail="Изменить"
          onPress={rename}
        />
      </Card>

      <Card title="Сценарии">
        {vm.summaries.map(({ scenario, status, progress }) => (
          <ScenarioRow
            key={scenario.id}
            icon={scenario.icon}
            title={scenario.title}
            status={status}
            progress={progress}
            onPress={() => router.push(`/scenario/${scenario.id}`)}
          />
        ))}
      </Card>

      <Card title="Журнал прохождения">
        {vm.journal.map((entry) => (
          <Row
            key={entry.id}
            icon="✅"
            title={entry.stageTitle}
            subtitle={`${entry.scenarioTitle} · ${formatDateTime(entry.reachedAt)} · за ${formatDuration(entry.duration)}`}
            detail={`+${entry.points}`}
          />
        ))}
        {vm.journal.length === 0 ? <Row title="Пока нет пройденных этапов" /> : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  loader: { marginTop: 24 },
});
