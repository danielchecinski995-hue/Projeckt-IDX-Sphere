# 📱 Budowanie APK dla Android

## Wymagania

1. **Konto Expo** (darmowe)
   - Zarejestruj się na: https://expo.dev/signup
   - Zapamiętaj login i hasło

## Krok 1: Zaloguj się do Expo

```bash
cd /Users/danielpraca/Desktop/live-sport-sphere-mobile
npx eas-cli login
```

Podaj swój login i hasło do Expo.

## Krok 2: Skonfiguruj projekt (tylko raz)

```bash
npx eas-cli build:configure
```

To utworzy konfigurację EAS Build dla projektu.

## Krok 3: Zbuduj APK

**Opcja A: APK do testów (szybsze, ~10-15 minut)**

```bash
npx eas-cli build --platform android --profile preview
```

**Opcja B: APK produkcyjny**

```bash
npx eas-cli build --platform android --profile production
```

## Krok 4: Poczekaj na build

Build jest wykonywany w chmurze Expo. Zobaczysz:
- Link do dashboard Expo gdzie możesz śledzić postęp
- Progres budowania w terminalu
- Po zakończeniu otrzymasz link do pobrania APK

Czas budowania: **10-20 minut** (pierwsze budowanie może być dłuższe)

## Krok 5: Pobierz APK

Po zakończeniu build otrzymasz link do pobrania APK, np:
```
✔ Build finished
https://expo.dev/accounts/YOUR_USERNAME/projects/live-sport-sphere-mobile/builds/abc123...
```

1. Otwórz link w przeglądarce
2. Kliknij "Download" aby pobrać APK
3. Prześlij APK na telefon Android

## Krok 6: Zainstaluj na telefonie

1. **Prześlij APK na telefon** (email, Google Drive, USB, etc.)
2. **Włącz instalację z nieznanych źródeł:**
   - Ustawienia → Bezpieczeństwo → Nieznane źródła (włącz)
   - Lub: Ustawienia → Aplikacje → Dostęp specjalny → Instalowanie nieznanych aplikacji
3. **Otwórz plik APK** na telefonie
4. **Kliknij "Zainstaluj"**
5. **Gotowe!** Aplikacja pojawi się w menu

## 📋 Dodatkowe komendy

### Sprawdź status buildu
```bash
npx eas-cli build:list
```

### Zobacz szczegóły projektu
```bash
npx eas-cli project:info
```

### Anuluj build
```bash
npx eas-cli build:cancel
```

## 🐛 Rozwiązywanie problemów

### Problem: "Not logged in"
```bash
npx eas-cli whoami  # Sprawdź kto jest zalogowany
npx eas-cli login    # Zaloguj się ponownie
```

### Problem: "Project not configured"
```bash
npx eas-cli build:configure
```

### Problem: Build nie startuje
- Sprawdź czy masz aktywne połączenie z internetem
- Sprawdź czy jesteś zalogowany: `npx eas-cli whoami`
- Sprawdź logi: https://expo.dev

## 📝 Notatki

- **Darmowe konto Expo** ma limit buildów miesięcznie (zazwyczaj wystarczający)
- Build jest wykonywany w chmurze, nie potrzebujesz Android Studio
- APK można zainstalować na dowolnym urządzeniu Android
- Jeśli chcesz opublikować w Google Play Store, użyj profilu `production`

## 🚀 Szybki start

```bash
# 1. Zaloguj się
npx eas-cli login

# 2. Zbuduj APK
npx eas-cli build --platform android --profile preview

# 3. Poczekaj ~15 minut

# 4. Pobierz APK z linku

# 5. Zainstaluj na telefonie
```

---

**Gotowe!** Po tych krokach będziesz miał plik APK gotowy do instalacji na Androidzie.
