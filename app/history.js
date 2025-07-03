import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function HistoryScreen() {
  const [groupedHistory, setGroupedHistory] = useState({});

  const groupByDate = (items) => {
    return items.reduce((acc, item) => {
      const date = item.date.split(',')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem('history');
    const parsed = stored ? JSON.parse(stored) : [];
    setGroupedHistory(groupByDate(parsed));
  };

  const deleteSection = async (dateKey) => {
    const stored = await AsyncStorage.getItem('history');
    const parsed = stored ? JSON.parse(stored) : [];
    const filtered = parsed.filter(item => item.date.split(',')[0] !== dateKey);
    await AsyncStorage.setItem('history', JSON.stringify(filtered));
    setGroupedHistory(groupByDate(filtered));
  };

  const deleteEntry = async (idToDelete) => {
    const stored = await AsyncStorage.getItem('history');
    const parsed = stored ? JSON.parse(stored) : [];
    const filtered = parsed.filter(item => item.id !== idToDelete);
    await AsyncStorage.setItem('history', JSON.stringify(filtered));
    setGroupedHistory(groupByDate(filtered));
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📜 Prediction History</Text>

      {Object.keys(groupedHistory).length === 0 ? (
        <Text style={styles.empty}>No history yet.</Text>
      ) : (
        Object.entries(groupedHistory).map(([date, items]) => (
          <View key={date} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.dateHeader}>{date}</Text>
              <TouchableOpacity onPress={() => deleteSection(date)}>
                <Text style={styles.deleteSection}>🗑️</Text>
              </TouchableOpacity>
            </View>
            {items.map((item) => (
              <Swipeable
                key={item.id}
                renderRightActions={() => (
                  <TouchableOpacity
                    style={styles.swipeDelete}
                    onPress={() => deleteEntry(item.id)}
                  >
                    <Text style={styles.swipeDeleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
              >
                <View style={styles.card}>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  )}
                  <Text style={styles.text}>
                    <Text style={styles.label}>Class:</Text> {item.result.class}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={styles.label}>Confidence:</Text>{' '}
                    {(item.result.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              </Swipeable>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 20,
  },
  empty: {
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 20,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  deleteSection: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#374151',
  },
  swipeDelete: {
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  swipeDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
