import { Platform } from 'react-native';

/**
 * Adres backendu. Ustaw w pliku .env (patrz .env.example):
 *   EXPO_PUBLIC_API_URL=http://192.168.1.10:8080
 *
 * Bez zmiennej: emulator Androida łączy się z komputerem przez 10.0.2.2,
 * symulator iOS i przeglądarka przez localhost. Fizyczny telefon zawsze
 * potrzebuje adresu IP komputera w sieci lokalnej.
 */
const fallbackUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? fallbackUrl).replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Kalendarz Google: frontend gotowy, backendu (/api/calendar/*) jeszcze nie ma.
 * Włącz przez EXPO_PUBLIC_CALENDAR_ENABLED=true, gdy backend będzie gotowy.
 */
export const CALENDAR_ENABLED = process.env.EXPO_PUBLIC_CALENDAR_ENABLED === 'true';
