import axios from 'axios';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export const geocode = (q: string) =>
  axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`, {
    params: { access_token: MAPBOX_TOKEN, autocomplete: true, limit: 5 },
  });

export const directions = (coords: string) =>
  axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`, {
    params: { access_token: MAPBOX_TOKEN, geometries: 'geojson', overview: 'full' },
  });