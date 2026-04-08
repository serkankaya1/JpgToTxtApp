import RNFS from 'react-native-fs';

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function ensureExportDir(): Promise<string> {
  const dir = `${RNFS.DocumentDirectoryPath}/ocr-exports`;
  await RNFS.mkdir(dir);
  return dir;
}

export async function exportSelectionAsTxt(selectedText: string): Promise<string> {
  const dir = await ensureExportDir();
  const path = `${dir}/ocr_${timestamp()}.txt`;
  await RNFS.writeFile(path, selectedText, 'utf8');
  return path;
}

export async function exportSelectionAsJson(
  selectedText: string,
  selectedCount: number,
): Promise<string> {
  const dir = await ensureExportDir();
  const path = `${dir}/ocr_${timestamp()}.json`;
  const payload = {
    createdAt: new Date().toISOString(),
    selectedCount,
    text: selectedText,
  };
  await RNFS.writeFile(path, JSON.stringify(payload, null, 2), 'utf8');
  return path;
}
