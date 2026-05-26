// @ts-nocheck
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { authApi } from '../services/api';
import { directions } from '../services/mapbox';
import { useTheme } from '../context/ThemeContext';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

type RouteRecord = {
  id: number;
  destination: string;
  distance: number;
  duration: number;
  createdAt: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
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

const ReplayScreen = ({ route }: Props) => {
  const { token } = route.params;
  const { isDark, colors } = useTheme();
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [history, setHistory] = useState<RouteRecord[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeShape, setRouteShape] = useState<GeoJSON.Feature | null>(null);
  const [originCoord, setOriginCoord] = useState<[number, number] | null>(null);
  const [destCoord, setDestCoord] = useState<[number, number] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoadingList(true);
      authApi(token)
        .get('/routes/history')
        .then((res) => { if (active) setHistory(res.data); })
        .catch(() => {})
        .finally(() => { if (active) setLoadingList(false); });
      return () => { active = false; };
    }, [token]),
  );

  const loadReplay = async (item: RouteRecord) => {
    if (selectedId === item.id) return;
    setSelectedId(item.id);
    setRouteShape(null);
    setOriginCoord(null);
    setDestCoord(null);

    if (!item.originLat || !item.destLat) return;

    setLoadingRoute(true);
    try {
      const dirRes = await directions(
        `${item.originLng},${item.originLat};${item.destLng},${item.destLat}`,
      );
      const leg = dirRes.data.routes[0];
      const geometry: GeoJSON.LineString = leg.geometry;

      setRouteShape({ type: 'Feature', geometry, properties: {} });
      setOriginCoord([item.originLng, item.originLat]);
      setDestCoord([item.destLng, item.destLat]);

      cameraRef.current?.fitBounds(
        [Math.min(item.originLng, item.destLng), Math.min(item.originLat, item.destLat)],
        [Math.max(item.originLng, item.destLng), Math.max(item.originLat, item.destLat)],
        60,
        500,
      );
    } catch {
      // silently fail — route will just not draw
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView style={styles.map} styleURL={isDark ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street}>
          <MapboxGL.Camera ref={cameraRef} zoomLevel={11} centerCoordinate={[0, 0]} />

          {routeShape && (
            <MapboxGL.ShapeSource id="replayRoute" shape={routeShape}>
              <MapboxGL.LineLayer
                id="replayLine"
                style={{ lineColor: '#1a73e8', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
              />
            </MapboxGL.ShapeSource>
          )}

          {originCoord && (
            <MapboxGL.PointAnnotation id="replayOrigin" coordinate={originCoord}>
              <View style={styles.startPin}>
                <Ionicons name="navigate" size={14} color="#fff" />
              </View>
            </MapboxGL.PointAnnotation>
          )}

          {destCoord && (
            <MapboxGL.PointAnnotation id="replayDest" coordinate={destCoord}>
              <View style={styles.endPin} />
            </MapboxGL.PointAnnotation>
          )}
        </MapboxGL.MapView>

        {loadingRoute && (
          <View style={styles.mapOverlay}>
            <ActivityIndicator size="large" color="#1a73e8" />
          </View>
        )}

        {!selectedId && (
          <View style={styles.mapHint}>
            <Text style={styles.mapHintText}>Tap a route below to replay it</Text>
          </View>
        )}
      </View>

      {/* Route list */}
      <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.listTitle, { color: colors.muted }]}>Past Routes</Text>
        {loadingList ? (
          <ActivityIndicator color="#1a73e8" style={{ marginTop: 16 }} />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.muted }]}>No routes saved yet.</Text>
            }
            renderItem={({ item }) => {
              const selected = item.id === selectedId;
              const hasCoords = item.originLat !== 0 && item.destLat !== 0;
              return (
                <TouchableOpacity
                  style={[styles.card, selected && { backgroundColor: isDark ? '#2a3a5a' : '#f0f6ff' }]}
                  onPress={() => loadReplay(item)}
                  disabled={!hasCoords}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardLeft}>
                    <Ionicons
                      name={selected ? 'play-circle' : 'play-circle-outline'}
                      size={22}
                      color={selected ? '#1a73e8' : (hasCoords ? colors.muted : colors.border)}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.destination, { color: hasCoords ? colors.text : colors.muted }]} numberOfLines={1}>
                      {item.destination}
                    </Text>
                    <Text style={[styles.meta, { color: colors.subtext }]}>
                      {formatDistance(item.distance)} · {formatDuration(item.duration)}
                    </Text>
                    {!hasCoords && (
                      <Text style={[styles.noReplay, { color: colors.muted }]}>Saved before replay was added</Text>
                    )}
                  </View>
                  <Text style={[styles.date, { color: colors.muted }]}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      day: '2-digit', month: 'short',
                    })}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  mapHintText: { color: '#fff', fontSize: 13 },
  startPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  endPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e53935',
    borderWidth: 2,
    borderColor: '#fff',
  },
  listContainer: {
    height: 260,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 14,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 20, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  cardSelected: { backgroundColor: '#f0f6ff', marginHorizontal: -16, paddingHorizontal: 16, borderRadius: 0 },
  cardLeft: { marginRight: 10 },
  cardBody: { flex: 1 },
  destination: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  dimText: { color: '#bbb' },
  meta: { fontSize: 12, color: '#666' },
  noReplay: { fontSize: 11, color: '#bbb', marginTop: 2 },
  date: { fontSize: 11, color: '#aaa', marginLeft: 8 },
});

export default ReplayScreen;
