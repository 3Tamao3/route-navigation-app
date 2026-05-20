import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { authApi } from '../services/api';

type RouteRecord = {
  id: number;
  destination: string;
  distance: number;
  duration: number;
  createdAt: string;
};

type Props = {
  route: { params: { token: string } };
};

const formatDistance = (m: number) =>
  m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

const formatDuration = (s: number) => {
  const mins = Math.round(s / 60);
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins} min`;
};

const HistoryScreen = ({ route }: Props) => {
  const { token } = route.params;
  const [history, setHistory] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      authApi(token)
        .get('/routes/history')
        .then((res) => { if (active) setHistory(res.data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [token]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={history.length === 0 ? styles.center : styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No routes saved yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.destination} numberOfLines={1}>{item.destination}</Text>
          <Text style={styles.meta}>
            {formatDistance(item.distance)} · {formatDuration(item.duration)}
          </Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  empty: { color: '#888', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  destination: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
  meta: { fontSize: 13, color: '#555', marginBottom: 2 },
  date: { fontSize: 12, color: '#999' },
});

export default HistoryScreen;
