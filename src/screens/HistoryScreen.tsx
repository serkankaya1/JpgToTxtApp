import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Share from 'react-native-share';
import {StoredHistoryItem} from '../storage/historyStorage';

type Props = {
  history: StoredHistoryItem[];
  onToggleFavorite: (id: string) => Promise<void>;
  onBack: () => void;
};

export default function HistoryScreen({
  history,
  onToggleFavorite,
  onBack,
}: Props): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return history;
    }

    const source = onlyFavorites ? history.filter(item => item.isFavorite) : history;
    return source.filter(
      item =>
        item.selectedText.toLowerCase().includes(q) ||
        new Date(item.createdAt).toLocaleString().toLowerCase().includes(q),
    );
  }, [history, onlyFavorites, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Export History</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search text or date..."
          placeholderTextColor="#93A0B5"
        />
        <Pressable
          style={[styles.filterButton, onlyFavorites && styles.filterButtonActive]}
          onPress={() => setOnlyFavorites(prev => !prev)}>
          <Text
            style={[
              styles.filterButtonText,
              onlyFavorites && styles.filterButtonTextActive,
            ]}>
            Favorites
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.fileType}>{item.fileType.toUpperCase()}</Text>
              <Pressable onPress={() => onToggleFavorite(item.id)}>
                <Text style={styles.favoriteMark}>
                  {item.isFavorite ? '★ Favorite' : '☆ Favorite'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.preview} numberOfLines={2}>
              {item.selectedText}
            </Text>
            <View style={styles.row}>
              <Pressable
                style={styles.action}
                onPress={async () => {
                  await Share.open({url: `file://${item.filePath}`});
                }}>
                <Text style={styles.actionText}>Share File</Text>
              </Pressable>
              <Pressable
                style={[styles.action, styles.secondary]}
                onPress={() => Linking.openURL(`file://${item.filePath}`)}>
                <Text style={styles.secondaryText}>Open</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exported PDF yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  header: {padding: 16, gap: 8},
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6EEF9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {color: '#1D4ED8', fontWeight: '600'},
  title: {fontSize: 22, fontWeight: '700', color: '#1F2937'},
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1DAEA',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1F2937',
  },
  filterButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E9EFFA',
  },
  filterButtonActive: {backgroundColor: '#1E66DC'},
  filterButtonText: {color: '#1D4ED8', fontWeight: '600'},
  filterButtonTextActive: {color: '#FFFFFF'},
  listContent: {padding: 16, gap: 10},
  card: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5EAF3',
  },
  date: {fontWeight: '600', color: '#374151'},
  metaRow: {flexDirection: 'row', justifyContent: 'space-between'},
  fileType: {fontSize: 12, color: '#64748B', fontWeight: '700'},
  favoriteMark: {fontSize: 12, color: '#D97706', fontWeight: '700'},
  preview: {color: '#4B5563'},
  row: {flexDirection: 'row', gap: 8},
  action: {
    borderRadius: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {color: '#FFFFFF', fontWeight: '600'},
  secondary: {backgroundColor: '#EFF6FF'},
  secondaryText: {color: '#1D4ED8', fontWeight: '600'},
  emptyContainer: {paddingTop: 24, alignItems: 'center'},
  emptyText: {color: '#6B7280'},
});
