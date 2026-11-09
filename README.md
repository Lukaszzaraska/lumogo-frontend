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
| Logowanie | `POST /api/auth/login` |
| Rejestracja (nazwisko opcjonalne, płeć jeszcze nie jest zapisywana) | `POST /api/auth/register` |
| Home – karta warunków | `GET /api/conditions/today` (na razie Warszawa, bez lokalizacji telefonu) |
| Home / Chat – imię użytkownika | z odpowiedzi logowania/rejestracji |

Nadal z makiety: lokalizacja w nagłówku, rekomendacja Lumo, planer okna pogodowego (brak endpointu prognozy).
Sesja jest tylko w pamięci: po zamknięciu aplikacji trzeba zalogować się ponownie.

Kod API: `src/api/` (`client.ts` – wspólne wywołanie i błędy, `config.ts` – adres serwera).
