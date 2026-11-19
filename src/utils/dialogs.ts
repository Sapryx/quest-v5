import { Alert, Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export function confirmAction(title: string, message: string, actionTitle: string): Promise<boolean> {
  if (isWeb) return Promise.resolve(window.confirm(`${title}\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
      { text: actionTitle, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function promptText(title: string, initial = ''): Promise<string | null> {
  if (isWeb) return Promise.resolve(window.prompt(title, initial));
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
