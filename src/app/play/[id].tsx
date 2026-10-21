import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Row } from '@/components/Row';
import { HINT_PENALTY } from '@/models/quest';
import { colors } from '@/theme';
import { formatDuration } from '@/utils/format';
import { usePlayViewModel } from '@/viewmodels/usePlayViewModel';

export default function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const playthroughId = Number(id);
  const vm = usePlayViewModel(playthroughId);

  const scan = () => {
    vm.clearFeedback();
    router.push({ pathname: '/scan', params: { playthroughId } });
  };

  if (!vm.playthrough || !vm.scenario) {
    return <Text style={styles.empty}>Игра не найдена</Text>;
  }

  if (vm.finished || !vm.stage) {
    return (
      <View style={[styles.screen, styles.finish]}>
        <Stack.Screen options={{ title: vm.scenario.title }} />
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.finishTitle}>Квест пройден!</Text>
        <Text style={styles.finishText}>
          {vm.playthrough.score} баллов · {formatDuration(vm.totalTime)}
        </Text>
        {vm.feedback?.success ? <Text style={styles.finishText}>{vm.feedback.message}</Text> : null}
        <Button title="На главную" primary onPress={() => router.dismissTo('/')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: `Этап ${vm.stageNumber} из ${vm.stageCount}` }} />

      <View style={styles.progress}>
        <ProgressBar value={(vm.stageNumber - 1) / vm.stageCount} />
        <Text style={styles.progressText}>Набрано баллов: {vm.playthrough.score}</Text>
      </View>

      {vm.feedback ? (
        <View style={[styles.feedback, vm.feedback.success ? styles.success : styles.failure]}>
          <Text style={styles.feedbackText}>
            {vm.feedback.success ? '✅' : '⛔'} {vm.feedback.message}
          </Text>
        </View>
      ) : null}

      <Card title={vm.stage.title}>
        <Text style={styles.riddle}>{vm.stage.riddle}</Text>
      </Card>

      <Card title="Подсказки">
        {vm.shownHints.map((hint, index) => (
          <Row key={index} icon="💡" title={hint} />
        ))}
        {vm.canRevealHint ? (
          <Row icon="❔" title="Показать подсказку" detail={`−${HINT_PENALTY} б.`} onPress={vm.revealHint} />
        ) : null}
        {!vm.canRevealHint && vm.shownHints.length === 0 ? <Row title="Подсказок нет" /> : null}
      </Card>

      <Card title="Условие перехода">
        <Text style={styles.condition}>{vm.stage.condition}</Text>
        <Row icon="⭐" title="Баллы за этап" detail={String(vm.availablePoints)} />
      </Card>

      <Button title="Сканировать метку" primary onPress={scan} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  empty: { color: colors.secondaryText, textAlign: 'center', marginTop: 40 },
  progress: { marginHorizontal: 32, marginBottom: 20, gap: 6 },
  progressText: { color: colors.secondaryText, fontSize: 13, textAlign: 'center' },
  riddle: { color: colors.text, fontSize: 20, lineHeight: 28, padding: 16, fontStyle: 'italic' },
  condition: { color: colors.text, fontSize: 17, padding: 16, paddingBottom: 8 },
  feedback: { marginHorizontal: 16, marginBottom: 20, borderRadius: 12, padding: 14 },
  success: { backgroundColor: colors.success },
  failure: { backgroundColor: colors.danger },
  feedbackText: { color: 'white', fontSize: 17, fontWeight: '600' },
  finish: { justifyContent: 'center', paddingTop: 0 },
  trophy: { fontSize: 80, textAlign: 'center' },
  finishTitle: { color: colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  finishText: { color: colors.secondaryText, fontSize: 17, textAlign: 'center', marginTop: 8, marginBottom: 32 },
});
