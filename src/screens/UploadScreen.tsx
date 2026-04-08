import React from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

type Props = {
  isBusy: boolean;
  error: string | null;
  onImageSelected: (uri: string) => Promise<void>;
  onBatchImagesSelected: (uris: string[]) => Promise<void>;
  onHistoryPress: () => void;
};

async function requestAndroidMediaPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestAndroidCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function resolveUri(response: ImagePickerResponse): string | undefined {
  return response.assets?.[0]?.uri;
}

export default function UploadScreen({
  isBusy,
  error,
  onImageSelected,
  onBatchImagesSelected,
  onHistoryPress,
}: Props): React.JSX.Element {
  const onPickFromGallery = async () => {
    const granted = await requestAndroidMediaPermission();
    if (!granted) {
      Alert.alert('Permission required', 'Media permission is required.');
      return;
    }

    const response = await launchImageLibrary({mediaType: 'photo'});
    const uri = resolveUri(response);
    if (!uri) {
      return;
    }
    await onImageSelected(uri);
  };

  const onCapturePhoto = async () => {
    const granted = await requestAndroidCameraPermission();
    if (!granted) {
      Alert.alert('Permission required', 'Camera permission is required.');
      return;
    }

    const response = await launchCamera({mediaType: 'photo'});
    const uri = resolveUri(response);
    if (!uri) {
      return;
    }
    await onImageSelected(uri);
  };

  const onPickMultipleFromGallery = async () => {
    const granted = await requestAndroidMediaPermission();
    if (!granted) {
      Alert.alert('Permission required', 'Media permission is required.');
      return;
    }

    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });
    const uris =
      response.assets?.map(asset => asset.uri).filter(Boolean) as string[] | undefined;
    if (!uris?.length) {
      return;
    }
    await onBatchImagesSelected(uris);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Offline OCR + PDF</Text>
      <Text style={styles.subtitle}>
        Load image, extract text, select lines, and convert to PDF.
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, isBusy && styles.buttonDisabled]}
          onPress={onPickFromGallery}
          disabled={isBusy}>
          <Text style={styles.buttonText}>Select From Gallery</Text>
        </Pressable>
        <Pressable
          style={[styles.button, isBusy && styles.buttonDisabled]}
          onPress={onCapturePhoto}
          disabled={isBusy}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </Pressable>
        <Pressable
          style={[styles.button, isBusy && styles.buttonDisabled]}
          onPress={onPickMultipleFromGallery}
          disabled={isBusy}>
          <Text style={styles.buttonText}>Batch Select Images</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={onHistoryPress}>
          <Text style={styles.secondaryText}>Open History</Text>
        </Pressable>
      </View>

      {isBusy ? <Text style={styles.info}>Processing image...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, gap: 16},
  title: {fontSize: 26, fontWeight: '700', color: '#1F2937'},
  subtitle: {fontSize: 15, color: '#6B7280'},
  actions: {gap: 10},
  button: {
    borderRadius: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  buttonDisabled: {opacity: 0.6},
  buttonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '600'},
  secondary: {backgroundColor: '#EFF6FF'},
  secondaryText: {color: '#1D4ED8', fontWeight: '600', fontSize: 15},
  info: {color: '#374151', fontWeight: '500'},
  error: {color: '#B91C1C', fontWeight: '500'},
});
