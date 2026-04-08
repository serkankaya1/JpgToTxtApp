import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import TextBlockList from '../components/TextBlockList';
import SelectionToolbar from '../components/SelectionToolbar';
import {OcrTextBlock} from '../types';

type Props = {
  blocks: OcrTextBlock[];
  selectedIds: Set<string>;
  selectedText: string;
  isBusy: boolean;
  error: string | null;
  onBack: () => void;
  onToggleSelection: (id: string) => void;
  onGeneratePdf: () => void;
  onExportTxt: () => void;
  onExportJson: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onCleanupNormalize: () => void;
  onCleanupMergeLines: () => void;
};

export default function OcrResultScreen({
  blocks,
  selectedIds,
  selectedText,
  isBusy,
  error,
  onBack,
  onToggleSelection,
  onGeneratePdf,
  onExportTxt,
  onExportJson,
  onSelectAll,
  onClearSelection,
  onCleanupNormalize,
  onCleanupMergeLines,
}: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>OCR Results</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.helpText}>Tap text blocks to select/unselect.</Text>
      <View style={styles.cleanupRow}>
        <Pressable style={styles.cleanupButton} onPress={onCleanupNormalize}>
          <Text style={styles.cleanupButtonText}>Normalize Spaces</Text>
        </Pressable>
        <Pressable style={styles.cleanupButton} onPress={onCleanupMergeLines}>
          <Text style={styles.cleanupButtonText}>Merge Lines</Text>
        </Pressable>
      </View>

      <View style={styles.listWrapper}>
        <TextBlockList
          blocks={blocks}
          selectedIds={selectedIds}
          onToggleSelection={onToggleSelection}
        />
      </View>

      <SelectionToolbar
        selectedCount={selectedIds.size}
        selectedText={selectedText}
        isBusy={isBusy}
        onGeneratePdf={onGeneratePdf}
        onExportTxt={onExportTxt}
        onExportJson={onExportJson}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F8FC'},
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E5ECF8',
  },
  backButtonText: {color: '#1E3A8A', fontWeight: '600'},
  title: {fontSize: 22, fontWeight: '700', color: '#1F2937'},
  helpText: {paddingHorizontal: 16, color: '#6B7280'},
  cleanupRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  cleanupButton: {
    borderRadius: 8,
    backgroundColor: '#E8EEFA',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cleanupButtonText: {color: '#1D4ED8', fontWeight: '600'},
  listWrapper: {flex: 1},
  error: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#B91C1C',
    fontWeight: '500',
  },
});
