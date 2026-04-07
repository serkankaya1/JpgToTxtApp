import {NativeModules} from 'react-native';
import {OcrTextBlock} from '../../types';
import {normalizeImageForOcr} from '../../utils/imagePreprocess';

type OcrNativeModule = {
  recognizeText(uri: string): Promise<OcrTextBlock[]>;
};

const {OcrModule} = NativeModules as {OcrModule?: OcrNativeModule};

export async function extractTextFromImage(uri: string): Promise<OcrTextBlock[]> {
  if (!OcrModule) {
    throw new Error('OcrModule is not registered on Android.');
  }

  const normalizedUri = await normalizeImageForOcr(uri);
  const result = await OcrModule.recognizeText(normalizedUri);
  return result.filter(item => item.text && item.text.trim().length > 0);
}
