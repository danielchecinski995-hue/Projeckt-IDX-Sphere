# Live Sport Sphere - Mobile App

Aplikacja mobilna do przeglądania publicznych turniejów sportowych (viewer mode).

## 🚀 Co zostało zaimplementowane

### ✅ Struktura projektu
```
src/
├── components/       # Komponenty wielokrotnego użytku (puste na razie)
├── navigation/       # Konfiguracja nawigacji
│   └── AppNavigator.tsx
├── screens/          # Ekrany aplikacji
│   ├── search/
│   │   └── SearchScreen.tsx        # Lista publicznych turniejów
│   ├── tournament/
│   │   └── TournamentDetailScreen.tsx  # Szczegóły turnieju z zakładkami
│   └── match/
│       └── MatchDetailScreen.tsx   # Szczegóły meczu
├── services/         # Serwisy API
│   └── api.ts                      # Axios + endpointy API
├── types/            # TypeScript types
│   └── index.ts
└── utils/            # Funkcje pomocnicze (puste na razie)
```

### ✅ Funkcjonalności

1. **SearchScreen** - Wyszukiwanie publicznych turniejów
   - Lista wszystkich publicznych turniejów
   - Pull-to-refresh
   - Wyświetla nazwę, status, format, kod turnieju
   - Kliknięcie przenosi do szczegółów turnieju

2. **TournamentDetailScreen** - Szczegóły turnieju
   - 3 zakładki: Mecze, Tabela, Drużyny
   - **Mecze**: Lista wszystkich meczy z wynikami i statusem
   - **Tabela**: Tabela ligowa (dla turniejów ligowych)
   - **Drużyny**: Lista wszystkich drużyn w turnieju
   - Kliknięcie meczu przenosi do szczegółów

3. **MatchDetailScreen** - Szczegóły meczu
   - Wyświetla wynik meczu
   - Status meczu (zaplanowany, na żywo, zakończony)
   - Data i godzina meczu
   - Informacje dodatkowe (runda, numer meczu)
   - Podstawowe statystyki

### ✅ Technologie

- **React Native + Expo** - Framework
- **TypeScript** - Typed JavaScript
- **React Navigation** - Nawigacja w aplikacji
- **React Query (@tanstack/react-query)** - Cache i zarządzanie stanem API
- **Axios** - HTTP client
- **Expo Status Bar** - Status bar styling

## 📱 Jak uruchomić

### 🌐 Uruchomienie w Project IDX (zalecane)

Project IDX to środowisko deweloperskie w chmurze od Google, które eliminuje problemy z konfiguracją lokalną.

#### Jak otworzyć projekt w IDX:
1. Zaloguj się na [idx.google.com](https://idx.google.com)
2. Kliknij **Import a Repo** lub **Open existing workspace**
3. Wklej URL do repozytorium GitHub lub otwórz istniejący workspace
4. IDX automatycznie:
   - Zainstaluje wszystkie zależności (Node.js, Android SDK, JDK)
   - Uruchomi `npm install`
   - Uruchomi Expo z tunelem
5. Zeskanuj kod QR w Expo Go lub użyj podglądu Web

#### Dostępne komendy w IDX:
```bash
npm start:tunnel     # Uruchom Expo z tunelem (dla zdalnego dostępu)
npm run web         # Podgląd w przeglądarce (wbudowany w IDX)
npm run android     # Build Android (używa emulatora IDX)
npm run build:android  # Zbuduj APK
```

#### Zalety Project IDX:
- ✅ Nie wymaga instalacji Android Studio lokalnie
- ✅ Wbudowany emulator Android
- ✅ Automatyczna konfiguracja środowiska
- ✅ Dostęp z dowolnego urządzenia przez przeglądarkę
- ✅ Współpraca zespołowa w czasie rzeczywistym
- ✅ Darmowy dla projektów open source

---

### 💻 Uruchomienie lokalne (Windows/Mac/Linux)

#### Krok 1: Uruchom backend API
Upewnij się, że backend jest uruchomiony na http://localhost:3000

```bash
cd /Users/danielpraca/Desktop/Projekt/live-sport-sphere/backend
npm run dev
```

### Krok 2: Zainstaluj Expo Go na telefonie
- Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Krok 3: Uruchom aplikację mobilną
Expo już jest uruchomione w tle! Zobaczysz kod QR w terminalu.

Jeśli chcesz ponownie uruchomić:
```bash
cd /Users/danielpraca/Desktop/live-sport-sphere-mobile
npm start
```

### Krok 4: Zeskanuj kod QR
- Otwórz aplikację **Expo Go** na telefonie
- Zeskanuj kod QR z terminala
- Aplikacja się załaduje!

## 🔧 Konfiguracja

### API URL
API URL jest skonfigurowany w pliku `.env`:
```
API_URL=http://localhost:3000/api
```

**WAŻNE**: Na prawdziwym telefonie, `localhost` nie zadziała! Musisz użyć IP komputera:
```
API_URL=http://192.168.1.XXX:3000/api
```

Aby znaleźć IP swojego komputera:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

## 📋 Dostępne komendy

```bash
# Uruchom development server
npm start

# Uruchom na Android (wymaga Android Studio)
npm run android

# Uruchom na iOS (wymaga Xcode, tylko macOS)
npm run ios

# Uruchom w przeglądarce
npm run web
```

## 🎨 Styl aplikacji

Aplikacja używa niebieskiego motywu kolorystycznego:
- Primary: `#2563eb` (niebieski)
- Background: `#f8fafc` (jasny szary)
- Success: `#22c55e` (zielony)
- Error: `#ef4444` (czerwony)

## 📦 Budowanie APK dla Android

Aby zbudować plik APK (aplikację instalacyjną dla Android):

1. **Przejdź do folderu projektu**
   ```bash
   cd /Users/danielpraca/Desktop/live-sport-sphere-mobile
   ```

2. **Zaloguj się do Expo** (wymaga darmowego konta)
   ```bash
   npx eas-cli login
   ```

3. **Zbuduj APK**
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

4. **Poczekaj ~15 minut** - build jest wykonywany w chmurze

5. **Pobierz APK** z linku który otrzymasz po zakończeniu buildu

6. **Zainstaluj na telefonie Android**

**Szczegółowa instrukcja**: Zobacz [BUILD_APK.md](./BUILD_APK.md)

## 🚧 Co można dodać w przyszłości

1. **Autentykacja** - Logowanie i rejestracja
2. **Tryb moderatora** - Edycja turniejów z telefonu
3. **Push notifications** - Powiadomienia o meczach
4. **Live updates** - WebSocket dla live score
5. **Offline mode** - Pełne wsparcie offline z React Query
6. **Ulubione turnieje** - Zapisywanie ulubionych
7. **Filtry i wyszukiwanie** - Zaawansowane filtrowanie
8. **Dark mode** - Tryb ciemny

## 📝 Notatki

- Aplikacja jest w trybie **viewer only** (bez autentykacji)
- Wszystkie dane są tylko do odczytu
- API musi być uruchomiony i dostępny z sieci
- Na prawdziwym urządzeniu zmień `localhost` na IP komputera

## 🐛 Rozwiązywanie problemów

### Problem z cache podczas instalacji
Jeśli masz problemy z uprawnieniami npm cache:
```bash
# Użyj tymczasowego cache
npm install --cache /tmp/.npm-cache
```

### Metro Bundler nie startuje
```bash
# Wyczyść cache i restart
npx expo start -c
```

### Nie mogę połączyć się z API
1. Sprawdź czy backend jest uruchomiony
2. Sprawdź czy używasz właściwego IP (nie localhost)
3. Sprawdź czy telefon i komputer są w tej samej sieci WiFi
4. Sprawdź firewall na komputerze

---

**Status**: ✅ Gotowe do testowania
**Data utworzenia**: 2025-11-06
