import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { HeaderButton } from '@/components/HeaderButton';
import { colors } from '@/theme';
import { useScannerViewModel } from '@/viewmodels/useScannerViewModel';

export default function ScanScreen() {
  const { playthroughId } = useLocalSearchParams<{ playthroughId: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const vm = useScannerViewModel(Number(playthroughId));

  const onScanned = (code: string) => {
    if (vm.submit(code)) router.back();
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{ title: 'Сканер метки', headerLeft: () => <HeaderButton title="Закрыть" onPress={router.back} /> }}
      />
      {!permission ? null : permission.granted ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={(result) => onScanned(result.data)}
          />
          <View style={styles.frame} pointerEvents="none" />
          <Text style={styles.hint}>Наведите камеру на QR-метку локации</Text>
        </>
      ) : (
        <View style={styles.permission}>
          <Text style={styles.permissionText}>Для сканирования меток нужен доступ к камере.</Text>
          <Button title="Разрешить доступ" primary onPress={requestPermission} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  frame: { width: 240, height: 240, borderWidth: 3, borderColor: 'white', borderRadius: 24 },
  hint: { position: 'absolute', bottom: 80, color: 'white', fontSize: 17, textAlign: 'center' },
  permission: { alignSelf: 'stretch', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  permissionText: { color: colors.text, fontSize: 17, textAlign: 'center', margin: 24 },
});
