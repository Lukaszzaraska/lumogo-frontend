# Raport integracji frontendu z backendem LumoGo

Data sprawdzenia: 2 listopada 2026 r.

## Co zostało podłączone

Ekran rejestracji wysyła teraz żądanie:

`POST https://lumogo.onrender.com/api/auth/register`

Wysyłane dane:

```json
{
  "email": "user@example.com",
  "firstName": "Anna",
  "gender": "Woman",
  "password": "Haslo!123"
}
```

Jeżeli użytkownik nie wybierze płci, frontend wysyła `"gender": "-"`. Pole `repeatPassword` nie jest wysyłane, ponieważ służy tylko do sprawdzenia zgodności haseł w aplikacji.

Frontend czeka na poprawną odpowiedź backendu. Dopiero wtedy pokazuje ekran sukcesu. Przy błędzie pokazuje użytkownikowi `message` albo `error` zwrócone przez backend.

Adres backendu można zmienić przez zmienną `EXPO_PUBLIC_API_URL`. Bez niej aplikacja używa `https://lumogo.onrender.com`.

## Czego nie udało się potwierdzić

2 listopada 2026 r. backend nie odpowiedział na `GET /api/health` ani `GET /v3/api-docs` przez 120 sekund. Z tego powodu nie dało się odczytać Swaggera i potwierdzić dokładnego kontraktu.

Backend powinien potwierdzić, że rejestracja przyjmuje dokładnie pola:

- `email` jako tekst,
- `firstName` jako tekst,
- `gender` jako tekst i dopuszcza wartość `-`,
- `password` jako tekst.

Jeżeli backend używa innych nazw, na przykład `name` zamiast `firstName`, kontrakt albo frontend trzeba ujednolicić.

## Braki po stronie backendu potrzebne frontendowi

### Rejestracja i logowanie

- Jednolity format błędu, najlepiej `{ "message": "Czytelny komunikat" }`.
- Informacja, co zwraca poprawna rejestracja: profil użytkownika, token, sesję czy tylko status.
- Informacja, co zwraca `POST /api/auth/login` i jak frontend ma przechowywać/autoryzować sesję.
- Endpoint wylogowania, np. `POST /api/auth/logout`.
- Endpoint odświeżania tokenu, jeśli token wygasa.
- Endpoint „zapomniałem hasła” i endpoint ustawienia nowego hasła. Przycisk istnieje już w UI, ale nie ma go do czego podłączyć.
- Potwierdzenie sposobu działania logowania Google. Przyciski istnieją w UI, ale opisane API nie zawiera endpointu OAuth Google.

### Profil użytkownika

Frontend potrzebuje pełnego schematu odpowiedzi dla `GET /api/auth/profile?email=...` oraz requestu dla `PUT /api/auth/profile`.

Do potwierdzenia lub dodania są pola:

- `email`,
- `firstName`,
- `gender`,
- identyfikator użytkownika, np. `id`,
- opcjonalnie zdjęcie/avatar,
- opcjonalnie strefa czasowa i język.

Brakujące wartości w odpowiedziach powinny być zwracane jako `"-"` albo `null`. Najlepiej wybrać jeden sposób dla całego API i opisać go w Swaggerze.

### Zainteresowania

Dla `GET /api/interests/options`, `GET /api/interests/user?email=...` i `POST /api/interests` brakuje potwierdzonego schematu danych. Frontend potrzebuje co najmniej:

- trwałego `id` zainteresowania,
- nazwy wyświetlanej,
- opcjonalnej ikony,
- listy wybranych identyfikatorów użytkownika,
- jasnego requestu zapisu, np. `{ "email": "...", "interestIds": [1, 2] }`.

### Pogoda i widget

Dla `GET /api/conditions/today` frontend potrzebuje parametrów lokalizacji albo informacji, skąd backend bierze lokalizację. Odpowiedź powinna określać co najmniej:

- temperaturę i jednostkę,
- opis warunków,
- kod/typ pogody do dobrania ikony,
- lokalizację,
- czas pomiaru,
- opcjonalnie opady, wiatr i wilgotność.

Dla `GET /api/widget/status` potrzebny jest dokładny schemat odpowiedzi i lista możliwych statusów.

## Zalecany wspólny standard API

- Wszystkie odpowiedzi i requesty jako JSON z `Content-Type: application/json`.
- Poprawne kody HTTP: `200/201` sukces, `400` błędne dane, `401` brak logowania, `409` zajęty e-mail, `500` błąd serwera.
- Błędy w jednym formacie, np. `{ "message": "...", "code": "EMAIL_TAKEN", "field": "email" }`.
- Każdy endpoint, każde pole, wymagane wartości i przykładowe odpowiedzi opisane w `/v3/api-docs` i Swagger UI.
- CORS dopuszczający aplikację mobilną/development; jeśli używane są cookies, trzeba dokładnie opisać obsługę sesji.

## Najważniejszy następny krok

Uruchomić backend i uzupełnić Swagger tak, aby można było pobrać `/v3/api-docs`. Następnie porównać rzeczywisty schemat `POST /api/auth/register` z czterema polami wysyłanymi obecnie przez frontend i poprawić ewentualne różnice nazw lub typów.
