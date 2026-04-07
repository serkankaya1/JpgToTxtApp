import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ocr_pdf_history';
const MAX_ITEMS = 100;

export type StoredHistoryItem = {
  id: string;
  createdAt: string;
  imageUri: string;
  selectedText: string;
  filePath: string;
  fileType: 'pdf' | 'txt' | 'json';
  isFavorite: boolean;
};

type NewHistoryItem = Omit<StoredHistoryItem, 'id'>;

export async function getHistoryItems(): Promise<StoredHistoryItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addHistoryItem(item: NewHistoryItem): Promise<void> {
  const current = await getHistoryItems();
  const next: StoredHistoryItem[] = [
    {id: `${Date.now()}`, isFavorite: false, ...item},
    ...current,
  ].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function toggleHistoryFavorite(id: string): Promise<void> {
  const current = await getHistoryItems();
  const next = current.map(item =>
    item.id === id ? {...item, isFavorite: !item.isFavorite} : item,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
