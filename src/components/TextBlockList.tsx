import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {OcrTextBlock} from '../types';

type Props = {
  blocks: OcrTextBlock[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
};

export default function TextBlockList({
  blocks,
  selectedIds,
  onToggleSelection,
}: Props): React.JSX.Element {
  return (
    <FlatList
      data={blocks}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({item}) => {
        const selected = selectedIds.has(item.id);
        return (
          <Pressable
            style={[styles.block, selected && styles.blockSelected]}
            onPress={() => onToggleSelection(item.id)}>
            <Text style={[styles.blockText, selected && styles.blockTextSelected]}>
              {item.text}
            </Text>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No text blocks found.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {padding: 16, gap: 10},
  block: {
    borderWidth: 1,
    borderColor: '#CFD5DE',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  blockSelected: {
    borderColor: '#2F80ED',
    backgroundColor: '#EAF3FF',
  },
  blockText: {fontSize: 15, color: '#1E2430'},
  blockTextSelected: {color: '#0F4C9A', fontWeight: '600'},
  emptyContainer: {alignItems: 'center', paddingVertical: 30},
  emptyText: {color: '#6C7480'},
});
