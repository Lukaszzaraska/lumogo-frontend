# LumoGo – aplikacja mobilna (Expo)

## Uruchomienie z backendem lokalnie

1. Uruchom backend (repo `lumogo-backend`): `run.bat` albo `docker compose up --build`.
   Sprawdź `http://localhost:8080/api/health`.
2. Skopiuj `.env.example` do `.env` i ustaw adres backendu:
   - emulator Androida: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080`
   - fizyczny telefon w tej samej sieci Wi-Fi: `EXPO_PUBLIC_API_URL=http://<IP komputera>:8080`
     (port 8080 musi być otwarty w zaporze Windows)
3. `npm install`, potem `npx expo start` (po zmianie `.env` uruchom ponownie z `--clear`).

Bez `.env` aplikacja łączy się z `10.0.2.2:8080` na Androidzie i `localhost:8080` na iOS/web.

## Co jest podłączone do backendu

Wszystkie wywołania idą przez `src/api/client.ts` (adres z `EXPO_PUBLIC_API_URL`, token JWT, kody błędów).
Serwisy w `src/services/*` (ekrany LUM-54) są cienkimi nakładkami na ten klient. Użytkownik jest
zawsze brany z tokena: nie ma `userId` ani `email` w adresach.

| Ekran | Endpoint |
|---|---|
| Logowanie / rejestracja | `POST /api/auth/login`, `POST /api/auth/register` (zwracają token, `id`, `gender`) |
| Start aplikacji | sesja z `expo-secure-store`, odświeżenie `GET /api/auth/profile` w tle |
| Home – warunki | `GET /api/conditions/today` dla przybliżonej lokalizacji (bez zgody: Warszawa) |
| Chat – wynik | `GET /api/conditions/best-window` (najlepsze okno według pogody) |
| Chat – zapis planu, Saved plans | `POST/GET/DELETE /api/plans` |
| Preferences | `GET/PUT /api/preferences` |
| Edit profile | `PUT /api/auth/profile` (imię, płeć) |
| Change password | `POST /api/auth/change-password` |
| Profile – Delete account | `DELETE /api/auth/account` (wymóg Google Play) |
| Help & support, Privacy & terms | `GET /api/content/faq`, `GET /api/content/privacy` |

Wyłączone do czasu backendu: kalendarz Google (`EXPO_PUBLIC_CALENDAR_ENABLED=false`, patrz
`GOOGLE_CALENDAR_SETUP.md`), logowanie przez Google („Coming soon”), „Forgot password?”.
Nadal z makiety: ekran Weather (prognoza) i rekomendacja Lumo na Home.

Lokalizacja: tylko przybliżona (`ACCESS_COARSE_LOCATION`), bez śledzenia w tle; o zgodę pyta ekran
logowania i baner na Home. Współrzędne są zaokrąglane do ~1 km przed wysłaniem.
