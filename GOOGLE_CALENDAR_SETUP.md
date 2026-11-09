# Google Calendar setup

The mobile app uses native Google Sign-In to obtain a one-time server authorization code. Google tokens are exchanged and stored only by the Java backend.

## Google Cloud

1. Create or select a Google Cloud project.
2. Enable **Google Calendar API**.
3. Configure the OAuth consent screen and add the Calendar free/busy scope:
   `https://www.googleapis.com/auth/calendar.freebusy`.
4. Create OAuth clients for iOS (`com.lumogo.app`) and Android (`com.lumogo.app` plus the signing certificate SHA-1).
5. Create a **Web application** OAuth client for the backend. Its client ID is used by the app to request offline access; its client secret must exist only on the backend.
6. While the consent screen is in testing mode, add the Google accounts used for testing as test users.

## Mobile environment

Copy `.env.example` to `.env.local` and fill in both client IDs. Use an API URL reachable from the selected target:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Web application OAuth client ID
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: iOS OAuth client ID
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`: Android OAuth client ID (kept for documenting the native Google Cloud configuration)

- iOS simulator: `http://127.0.0.1:8080`
- Android emulator: `http://10.0.2.2:8080`
- physical phone: the Mac's LAN address, for example `http://192.168.1.20:8080`

Google Sign-In contains native code and does not work in Expo Go. Rebuild the development app after installing or changing its configuration:

```bash
npx expo run:android
# or
npx expo run:ios --device
```

## Backend

Configure `GOOGLE_WEB_CLIENT_ID` and `GOOGLE_WEB_CLIENT_SECRET` on the backend. See `/Users/zch/LumoGo-backend/README.md`. The production backend must use HTTPS and authenticated LumoGo user IDs instead of the development installation ID header.
