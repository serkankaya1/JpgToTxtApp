import React, {useMemo, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, StyleSheet, Text, useColorScheme, View} from 'react-native';
import UploadScreen from './src/screens/UploadScreen';
import OcrResultScreen from './src/screens/OcrResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import {extractTextFromImage} from './src/services/ocr/ocrService';
import {createPdfFromSelection} from './src/services/pdf/pdfService';
import {
  exportSelectionAsJson,
  exportSelectionAsTxt,
} from './src/services/export/fileExportService';
import {
  addHistoryItem,
  getHistoryItems,
  StoredHistoryItem,
  toggleHistoryFavorite,
} from './src/storage/historyStorage';
import {OcrTextBlock} from './src/types';
import {mergeBrokenLines, normalizeWhitespace} from './src/utils/textCleanup';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<OcrTextBlock[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<StoredHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'result' | 'history'>(
    'upload',
  );
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);

  const selectedText = useMemo(
    () =>
      blocks
        .filter(item => selectedIds.has(item.id))
        .map(item => item.text)
        .join('\n'),
    [blocks, selectedIds],
  );

  const loadHistory = async () => {
    const items = await getHistoryItems();
    setHistory(items);
  };

  const onImageSelected = async (uri: string) => {
    try {
      setError(null);
      setIsBusy(true);
      const textBlocks = await extractTextFromImage(uri);
      setImageUri(uri);
      setBlocks(textBlocks);
      setSelectedIds(new Set());
      setActiveTab('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const onBatchImagesSelected = async (uris: string[]) => {
    if (!uris.length) {
      return;
    }

    try {
      setError(null);
      setIsBusy(true);
      const combinedBlocks: OcrTextBlock[] = [];
      for (let i = 0; i < uris.length; i += 1) {
        setBatchProgress(`Processing ${i + 1}/${uris.length}`);
        const items = await extractTextFromImage(uris[i]);
        combinedBlocks.push(
          ...items.map(item => ({
            ...item,
            id: `${i}_${item.id}`,
          })),
        );
      }

      setImageUri(uris[0]);
      setBlocks(combinedBlocks);
      setSelectedIds(new Set());
      setActiveTab('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch OCR failed.');
    } finally {
      setBatchProgress(null);
      setIsBusy(false);
    }
  };

  const onGeneratePdf = async () => {
    if (!selectedText.trim()) {
      setError('Please select at least one text block.');
      return;
    }

    try {
      setError(null);
      setIsBusy(true);
      const pdfPath = await createPdfFromSelection(selectedText);
      await addHistoryItem({
        createdAt: new Date().toISOString(),
        imageUri: imageUri ?? '',
        selectedText,
        filePath: pdfPath,
        fileType: 'pdf',
      });
      await loadHistory();
      setActiveTab('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF creation failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const onExportTxt = async () => {
    if (!selectedText.trim()) {
      setError('Please select at least one text block.');
      return;
    }
    try {
      setError(null);
      setIsBusy(true);
      const filePath = await exportSelectionAsTxt(selectedText);
      await addHistoryItem({
        createdAt: new Date().toISOString(),
        imageUri: imageUri ?? '',
        selectedText,
        filePath,
        fileType: 'txt',
      });
      await loadHistory();
      setActiveTab('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TXT export failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const onExportJson = async () => {
    if (!selectedText.trim()) {
      setError('Please select at least one text block.');
      return;
    }
    try {
      setError(null);
      setIsBusy(true);
      const filePath = await exportSelectionAsJson(selectedText, selectedIds.size);
      await addHistoryItem({
        createdAt: new Date().toISOString(),
        imageUri: imageUri ?? '',
        selectedText,
        filePath,
        fileType: 'json',
      });
      await loadHistory();
      setActiveTab('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON export failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        {activeTab === 'upload' && (
          <UploadScreen
            isBusy={isBusy}
            error={error}
            onImageSelected={onImageSelected}
            onBatchImagesSelected={onBatchImagesSelected}
            onHistoryPress={async () => {
              await loadHistory();
              setActiveTab('history');
            }}
          />
        )}
        {activeTab === 'result' && (
          <OcrResultScreen
            blocks={blocks}
            selectedIds={selectedIds}
            selectedText={selectedText}
            isBusy={isBusy}
            error={error}
            onBack={() => setActiveTab('upload')}
            onToggleSelection={id =>
              setSelectedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) {
                  next.delete(id);
                } else {
                  next.add(id);
                }
                return next;
              })
            }
            onGeneratePdf={onGeneratePdf}
            onExportTxt={onExportTxt}
            onExportJson={onExportJson}
            onSelectAll={() => setSelectedIds(new Set(blocks.map(item => item.id)))}
            onClearSelection={() => setSelectedIds(new Set())}
            onCleanupNormalize={() =>
              setBlocks(prev =>
                prev.map(block => ({
                  ...block,
                  text: normalizeWhitespace(block.text),
                })),
              )
            }
            onCleanupMergeLines={() =>
              setBlocks(prev =>
                prev.map(block => ({
                  ...block,
                  text: mergeBrokenLines(block.text),
                })),
              )
            }
          />
        )}
        {activeTab === 'history' && (
          <HistoryScreen
            history={history}
            onToggleFavorite={async id => {
              await toggleHistoryFavorite(id);
              await loadHistory();
            }}
            onBack={() => setActiveTab('upload')}
          />
        )}
      </View>
      {batchProgress ? (
        <View style={styles.batchBanner}>
          <Text style={styles.batchBannerText}>{batchProgress}</Text>
        </View>
      ) : null}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  batchBanner: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  batchBannerText: {color: '#FFFFFF', fontWeight: '600'},
});

export default App;
