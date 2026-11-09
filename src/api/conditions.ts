import type { HomeConditionsData } from '../types/home';
import { apiRequest } from './client';

/** Odpowiedź z GET /api/conditions/today (WeatherConditionResponse w backendzie). */
type ConditionsDto = {
  date: string;
  temperatureC: number;
  windSpeedKmh: number;
  humidity: number;
  aqi: number;
  score: number;
  scoreCategory: string;
  latitude: number;
  longitude: number;
};

export function mapConditions(dto: ConditionsDto): HomeConditionsData {
  return {
    score: dto.score,
    maxScore: 100,
    temperatureCelsius: dto.temperatureC,
    windSpeedKmh: dto.windSpeedKmh,
    humidityPercent: dto.humidity,
    airQualityIndex: dto.aqi,
  };
}

/** Bez współrzędnych backend zwraca warunki dla Warszawy. */
export async function getTodayConditions(coords?: { latitude: number; longitude: number }) {
  const dto = await apiRequest<ConditionsDto>('/api/conditions/today', {
    query: { lat: coords?.latitude, lon: coords?.longitude },
  });
  return mapConditions(dto);
}
