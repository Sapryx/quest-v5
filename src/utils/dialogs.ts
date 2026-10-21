import { Alert } from 'react-native';

export function confirmAction(title: string, message: string, actionTitle: string): Promise<boolean> {
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
      { text: actionTitle, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function promptText(title: string, initial = ''): Promise<string | null> {
  return new Promise((resolve) =>
    Alert.prompt(
      title,
      undefined,
      [
        { text: 'Отмена', style: 'cancel', onPress: () => resolve(null) },
        { text: 'Сохранить', onPress: (value?: string) => resolve(value ?? '') },
      ],
      'plain-text',
      initial,
    ),
  );
}
