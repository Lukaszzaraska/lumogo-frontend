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

| Ekran | Endpoint |
|---|---|
| Logowanie / rejestracja | `POST /api/auth/login`, `POST /api/auth/register` (zwracają token JWT) |
| Start aplikacji | zapisana sesja z `expo-secure-store`, odświeżenie `GET /api/auth/profile` w tle |
| Home – warunki | `GET /api/conditions/today` dla przybliżonej lokalizacji telefonu |
| Home – nagłówek | imię z sesji, miasto z `expo-location` (reverse geocoding na telefonie) |
| Chat – wynik planera | `GET /api/conditions/best-window` (wybrany dzień i czas trwania) |
| Profil | imię, e-mail, wylogowanie |

Lokalizacja: tylko przybliżona (`ACCESS_COARSE_LOCATION`), raz na uruchomienie, bez śledzenia w tle.
Bez zgody aplikacja pokazuje pogodę dla Warszawy. Współrzędne są zaokrąglane do ~1 km przed wysłaniem.

Komunikaty błędów są tłumaczone z pola `code` w odpowiedzi backendu (`src/i18n/translations/pl.ts`, sekcja `errors`).

Nadal z makiety: rekomendacja Lumo na Home. Logowanie przez Google nie działa (pokazuje „Coming soon”).

Kod API: `src/api/` (`client.ts` – wywołania, token, błędy; `config.ts` – adres serwera).
