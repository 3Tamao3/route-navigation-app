// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import useLocation from '../hooks/useLocation';
import { geocode, directions } from '../services/mapbox';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

type Favorite = { id: number; destination: string };

type Props = {
  route: { params: { token: string; username: string } };
};

const MapScreen = ({ route }: Props) => {
  const { token, username } = route.params;
  const { isDark, colors } = useTheme();
  const { location } = useLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeShape, setRouteShape] = useState<GeoJSON.Feature | null>(null);
  const [trimmedShape, setTrimmedShape] = useState<GeoJSON.Feature | null>(null);
  const [destCoord, setDestCoord] = useState<[number, number] | null>(null);
  const [destName, setDestName] = useState<string>('');

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    authApi(token)
      .get('/favorites')
      .then((res) => setFavorites(res.data))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!destName) { setIsSaved(false); return; }
    setIsSaved(favorites.some((f) => f.destination === destName));
  }, [destName, favorites]);

  useEffect(() => {
    if (!routeShape || !location) { setTrimmedShape(routeShape); return; }
    const coords: [number, number][] = (routeShape.geometry as GeoJSON.LineString).coordinates as [number, number][];
    const { longitude: userLng, latitude: userLat } = location.coords;

    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const d = Math.hypot(coords[i][0] - userLng, coords[i][1] - userLat);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    }

    const ahead = [[userLng, userLat], ...coords.slice(nearestIdx + 1)] as [number, number][];
    setTrimmedShape({ type: 'Feature', geometry: { type: 'LineString', coordinates: ahead }, properties: {} });
  }, [location, routeShape]);

  const handleSearch = async (overrideQuery?: string) => {
    const searchQuery = overrideQuery ?? query;
    if (!searchQuery.trim()) return;
    if (!location) { setError('Waiting for location…'); return; }
    setError('');
    setLoading(true);
    setShowFavorites(false);
    try {
      const geoRes = await geocode(searchQuery);
      const feature = geoRes.data.features[0];
      if (!feature) { setError('Address not found'); setLoading(false); return; }

      const [destLng, destLat] = feature.center as [number, number];
      const { longitude: origLng, latitude: origLat } = location.coords;

      const dirRes = await directions(`${origLng},${origLat};${destLng},${destLat}`);
      const leg = dirRes.data.routes[0];
      const geometry: GeoJSON.LineString = leg.geometry;

      const name = feature.place_name ?? searchQuery;
      setRouteShape({ type: 'Feature', geometry, properties: {} });
      setDestCoord([destLng, destLat]);
      setDestName(name);
      if (overrideQuery) setQuery(overrideQuery);

      cameraRef.current?.fitBounds(
        [Math.min(origLng, destLng), Math.min(origLat, destLat)],
        [Math.max(origLng, destLng), Math.max(origLat, destLat)],
        60,
        500,
      );

      await authApi(token).post('/routes', {
        destination: name,
        distance: leg.distance,
        duration: leg.duration,
        originLat: origLat,
        originLng: origLng,
        destLat,
        destLng,
      });
    } catch {
      setError('Could not load route');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!destName) return;
    if (isSaved) {
      const fav = favorites.find((f) => f.destination === destName);
      if (!fav) return;
      await authApi(token).delete(`/favorites/${fav.id}`).catch(() => {});
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    } else {
      const res = await authApi(token).post('/favorites', { destination: destName }).catch(() => null);
      if (res) setFavorites((prev) => [res.data, ...prev]);
    }
  };

  const speedKmh =
    location?.coords.speed != null && location.coords.speed >= 0
      ? Math.round(location.coords.speed * 3.6)
      : null;

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { backgroundColor: colors.searchBox }]}>
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => setShowFavorites((v) => !v)}
        >
          <Ionicons
            name={showFavorites ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color="#1a73e8"
          />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search address…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />

        {destCoord && (
          <TouchableOpacity style={styles.starBtn} onPress={toggleFavorite}>
            <Ionicons
              name={isSaved ? 'star' : 'star-outline'}
              size={20}
              color={isSaved ? '#f5a623' : '#888'}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Go</Text>}
        </TouchableOpacity>
      </View>

      {showFavorites && favorites.length > 0 && (
        <View style={[styles.favDropdown, { backgroundColor: colors.card }]}>
          <FlatList
            data={favorites}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.favItem}
                onPress={() => {
                  setQuery(item.destination);
                  handleSearch(item.destination);
                }}
              >
                <Ionicons name="navigate-outline" size={15} color={colors.subtext} style={{ marginRight: 8 }} />
                <Text style={[styles.favItemText, { color: colors.text }]} numberOfLines={1}>{item.destination}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {showFavorites && favorites.length === 0 && (
        <View style={[styles.favDropdown, { backgroundColor: colors.card }]}>
          <Text style={[styles.favEmpty, { color: colors.muted }]}>No saved favorites yet.</Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <MapboxGL.MapView style={styles.map} styleURL={isDark ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street}>
        <MapboxGL.Camera ref={cameraRef} followUserLocation={!destCoord} zoomLevel={13} />

        {location && (
          // @ts-ignore — PointAnnotation types missing props definition in this version
          <MapboxGL.PointAnnotation
            id="userPosition"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={[styles.arrowWrapper, { transform: [{ rotate: `${location.coords.heading ?? 0}deg` }] }]}>
              <View style={styles.arrowTip} />
              <View style={styles.arrowBase} />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {trimmedShape && (
          <MapboxGL.ShapeSource id="route" shape={trimmedShape}>
            <MapboxGL.LineLayer
              id="routeLine"
              style={{ lineColor: '#1a73e8', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
            />
          </MapboxGL.ShapeSource>
        )}

        {destCoord && (
          <MapboxGL.PointAnnotation id="destination" coordinate={destCoord}>
            <View style={styles.pin} />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      <View style={styles.speedBox}>
        <Text style={styles.speedValue}>{speedKmh ?? '--'}</Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  favBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  starBtn: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  searchBtn: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  favDropdown: {
    position: 'absolute',
    top: 102,
    left: 12,
    right: 12,
    zIndex: 9,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    maxHeight: 220,
    overflow: 'hidden',
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  favItemText: { flex: 1, fontSize: 14, color: '#222' },
  favEmpty: {
    padding: 16,
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: '#fdd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    color: '#c00',
  },
  map: { flex: 1 },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e53935',
    borderWidth: 2,
    borderColor: '#fff',
  },
  speedBox: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 64,
  },
  speedValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  speedUnit: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: '500',
  },
  arrowWrapper: {
    alignItems: 'center',
  },
  arrowTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 22,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1a73e8',
  },
  arrowBase: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1a73e8',
    marginTop: -3,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default MapScreen;
