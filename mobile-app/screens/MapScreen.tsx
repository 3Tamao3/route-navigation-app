import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import useLocation from '../hooks/useLocation';
import { geocode, directions } from '../services/mapbox';
import { authApi } from '../services/api';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

type Props = {
  route: { params: { token: string; username: string } };
};

const MapScreen = ({ route }: Props) => {
  const { token, username } = route.params;
  const { location } = useLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeShape, setRouteShape] = useState<GeoJSON.Feature | null>(null);
  const [destCoord, setDestCoord] = useState<[number, number] | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!location) { setError('Waiting for location…'); return; }
    setError('');
    setLoading(true);
    try {
      const geoRes = await geocode(query);
      const feature = geoRes.data.features[0];
      if (!feature) { setError('Address not found'); setLoading(false); return; }

      const [destLng, destLat] = feature.center as [number, number];
      const { longitude: origLng, latitude: origLat } = location.coords;

      const dirRes = await directions(`${origLng},${origLat};${destLng},${destLat}`);
      const leg = dirRes.data.routes[0];
      const geometry: GeoJSON.LineString = leg.geometry;

      setRouteShape({ type: 'Feature', geometry, properties: {} });
      setDestCoord([destLng, destLat]);

      cameraRef.current?.fitBounds(
        [Math.min(origLng, destLng), Math.min(origLat, destLat)],
        [Math.max(origLng, destLng), Math.max(origLat, destLat)],
        60,
        500,
      );

      await authApi(token).post('/routes', {
        destination: feature.place_name ?? query,
        distance: leg.distance,
        duration: leg.duration,
      });
    } catch {
      setError('Could not load route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Search address…"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Go</Text>}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera ref={cameraRef} followUserLocation={!destCoord} zoomLevel={13} />
        <MapboxGL.UserLocation visible />

        {routeShape && (
          <MapboxGL.ShapeSource id="route" shape={routeShape}>
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
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  searchBtnText: { color: '#fff', fontWeight: '600' },
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
});

export default MapScreen;
