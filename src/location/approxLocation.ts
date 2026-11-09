import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type ApproxLocation = {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
};

/** Gdy brak zgody lub lokalizacji: backend i tak liczy pogodę dla Warszawy. */
export const DEFAULT_LOCATION: ApproxLocation = {
  latitude: 52.2297,
  longitude: 21.0122,
  city: 'Warszawa',
  region: 'mazowieckie',
};

let cached: Promise<ApproxLocation> | null = null;

async function resolveLocation(): Promise<ApproxLocation> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return DEFAULT_LOCATION;

    // Najpierw ostatnia znana pozycja (natychmiast, bez GPS), potem jednorazowo niska dokładność.
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 30 * 60 * 1000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));

    const { latitude, longitude } = position.coords;
    let city = '';
    let region = '';
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      city = place?.city ?? place?.subregion ?? '';
      region = place?.region ?? '';
    } catch {
      // nazwa miasta jest tylko dodatkiem
    }

    return {
      latitude: Math.round(latitude * 100) / 100,
      longitude: Math.round(longitude * 100) / 100,
      city,
      region,
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}

/**
 * Przybliżona lokalizacja, ustalana raz na uruchomienie aplikacji (jedno zapytanie o zgodę,
 * bez śledzenia w tle). Współrzędne zaokrąglone do ~1 km przed wysłaniem do backendu.
 */
export function getApproxLocation() {
  cached ??= resolveLocation();
  return cached;
}

export function useApproxLocation() {
  const [location, setLocation] = useState<ApproxLocation | null>(null);

  useEffect(() => {
    let active = true;
    getApproxLocation().then((result) => {
      if (active) setLocation(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return location;
}
