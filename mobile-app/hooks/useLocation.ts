import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export default function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        subRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 },
          setLocation,
        );
      }
    })();
    return () => { subRef.current?.remove(); };
  }, []);

  return { location, setLocation };
}
