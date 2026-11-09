import { apiRequest } from './client';

/** Odpowiedź z GET /api/conditions/best-window (BestWindowResponse w backendzie). */
export type BestWindow = {
  date: string;
  start: string;
  end: string;
  durationMinutes: number;
  score: number;
  scoreCategory: string;
  temperatureC: number;
  windSpeedKmh: number;
  precipitationProbability: number;
  aqi: number | null;
};

export function getBestWindow(params: {
  latitude: number;
  longitude: number;
  date: string;
  durationMinutes: number;
}) {
  return apiRequest<BestWindow>('/api/conditions/best-window', {
    auth: false,
    query: {
      lat: params.latitude,
      lon: params.longitude,
      date: params.date,
      durationMinutes: params.durationMinutes,
    },
  });
}
