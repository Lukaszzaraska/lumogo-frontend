import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { CALENDAR_ENABLED } from '../api/config';
import { calendarApi } from '../services/calendarApi';

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.freebusy';
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let googleSigninModule: typeof import('@react-native-google-signin/google-signin') | null = null;

try {
  googleSigninModule = require('@react-native-google-signin/google-signin');
  if (webClientId && googleSigninModule) {
    googleSigninModule.GoogleSignin.configure({
      forceCodeForRefreshToken: true,
      iosClientId,
      offlineAccess: true,
      scopes: [CALENDAR_SCOPE],
      webClientId,
    });
  }
} catch {
  // Native module not available (e.g. Expo Go)
}

function getConnectErrorMessage(error: unknown) {
  if (!googleSigninModule || !googleSigninModule.isErrorWithCode(error)) {
    return error instanceof Error ? error.message : 'Could not connect Google Calendar.';
  }

  switch (error.code) {
    case googleSigninModule.statusCodes.IN_PROGRESS:
      return 'Google Calendar connection is already in progress.';
    case googleSigninModule.statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return 'Google Play Services are unavailable or need to be updated.';
    default:
      return error.message || 'Could not connect Google Calendar.';
  }
}

export function useGoogleCalendar() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    if (!CALENDAR_ENABLED) {
      setLoading(false);
      return;
    }
    try {
      const status = await calendarApi.getStatus();
      setConnected(status.connected);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const connect = useCallback(async () => {
    if (!googleSigninModule) {
      setError('Google Sign-In is not available in this build.');
      return;
    }
    if (!webClientId) {
      setError('Missing Google Web OAuth Client ID.');
      return;
    }
    if (Platform.OS === 'ios' && !iosClientId) {
      setError('Missing Google iOS OAuth Client ID.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        await googleSigninModule.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const result = await googleSigninModule.GoogleSignin.signIn();
      if (result.type !== 'success') return;

      const authorizationCode = result.data.serverAuthCode;
      if (!authorizationCode) {
        throw new Error('Google did not return a server authorization code.');
      }

      await calendarApi.exchangeCode({ authorizationCode });
      setConnected(true);
    } catch (connectError) {
      setError(getConnectErrorMessage(connectError));
    } finally {
      setLoading(false);
    }
  }, []);

  return { connect, connected, error, loading };
}
