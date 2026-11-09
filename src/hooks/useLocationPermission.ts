import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export function useLocationPermission() {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  const check = useCallback(async () => {
    const { status: current } = await Location.getForegroundPermissionsAsync();
    setStatus(current === 'granted' ? 'granted' : current === 'undetermined' ? 'undetermined' : 'denied');
  }, []);

  useEffect(() => {
    void check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check();
    });
    return () => subscription.remove();
  }, [check]);

  const request = useCallback(async () => {
    const { status: current } = await Location.requestForegroundPermissionsAsync();
    setStatus(current === 'granted' ? 'granted' : 'denied');
    return current === 'granted';
  }, []);

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return { status, request, openSettings };
}
