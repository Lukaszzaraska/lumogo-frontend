import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '../../../contexts/AuthContext';
import { homeHeaderMock } from '../../../mocks/home';
import type { HomeHeaderData } from '../../../types/home';

type UseHomeHeaderResult = {
  data: HomeHeaderData;
  isLoading: boolean;
  error: Error | null;
};

export function useHomeHeader(): UseHomeHeaderResult {
  const { user } = useAuth();
  const [location, setLocation] = useState(homeHeaderMock.location);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const [geocode] = await Location.reverseGeocodeAsync(position.coords);
      if (cancelled || !geocode) return;

      setLocation({
        city: geocode.city ?? geocode.subregion ?? location.city,
        region: geocode.region ?? location.region,
      });
    })();

    return () => { cancelled = true; };
  }, []);

  return {
    data: {
      ...homeHeaderMock,
      user: {
        ...homeHeaderMock.user,
        firstName: user?.firstName ?? homeHeaderMock.user.firstName,
      },
      location,
    },
    isLoading: false,
    error: null,
  };
}
