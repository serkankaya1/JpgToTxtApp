import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  selectedCount: number;
  selectedText: string;
  isBusy: boolean;
  onGeneratePdf: () => void;
  onExportTxt: () => void;
  onExportJson: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
};

export default function SelectionToolbar({
  selectedCount,
  selectedText,
  isBusy,
  onGeneratePdf,
  onExportTxt,
  onExportJson,
  onSelectAll,
  onClearSelection,
}: Props): React.JSX.Element {
  const onCopy = () => {
    if (!selectedText.trim()) {
      Alert.alert('Selection required', 'Please select at least one text block.');
      return;
    }

    Clipboard.setString(selectedText);
    Alert.alert('Copied', 'Selected text was copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{selectedCount} selected</Text>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={onSelectAll}>
          <Text style={styles.buttonText}>Select All</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onClearSelection}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={onCopy}>
          <Text style={styles.buttonText}>Copy</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onExportTxt}>
          <Text style={styles.buttonText}>TXT</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onExportJson}>
          <Text style={styles.buttonText}>JSON</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.primaryButton, isBusy && styles.buttonDisabled]}
          onPress={onGeneratePdf}
          disabled={isBusy}>
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            {isBusy ? 'Generating...' : 'Create PDF'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  count: {color: '#4B5563', fontWeight: '600'},
  actions: {flexDirection: 'row', gap: 8},
  button: {
    borderWidth: 1,
    borderColor: '#BFC7D3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F9FBFF',
  },
  primaryButton: {
    backgroundColor: '#1E66DC',
    borderColor: '#1E66DC',
  },
  buttonDisabled: {opacity: 0.5},
  buttonText: {color: '#243042', fontWeight: '600'},
  primaryButtonText: {color: '#FFFFFF'},
});
