# Hiszpański Quiz

Mobilna aplikacja webowa (PWA) do szybkiego ćwiczenia odmiany hiszpańskich czasowników i zaimków dopełnienia (bliższego/dalszego). React + TypeScript + Vite, bez backendu — dane czasowników są wbudowane w aplikację, a postęp użytkownika jest zapisywany w `localStorage` przeglądarki.

## Uruchomienie (tryb developerski)

```bash
npm install
npm run dev
```

Aplikacja wystartuje pod adresem `http://localhost:5173/`. Otwórz go w przeglądarce — najwygodniej w trybie urządzenia mobilnego (np. DevTools → Toggle device toolbar w Chrome).

## Budowanie wersji produkcyjnej

```bash
npm run build
npm run preview
```

`npm run build` tworzy katalog `dist/` z gotową aplikacją PWA (wraz z service workerem i manifestem). `npm run preview` uruchamia lokalny serwer serwujący tę zbudowaną wersję pod `http://localhost:4173/`.

## Instalacja jako aplikacja PWA na telefonie

1. Zbuduj aplikację (`npm run build`) i uruchom podgląd z dostępem w sieci lokalnej:
   ```bash
   npm run preview -- --host
   ```
2. Terminal wypisze adres sieciowy, np. `http://192.168.x.x:4173/` — upewnij się, że telefon jest w tej samej sieci Wi-Fi co komputer.
3. Otwórz ten adres w przeglądarce na telefonie:
   - **Android (Chrome):** menu (⋮) → „Zainstaluj aplikację” / „Dodaj do ekranu głównego”.
   - **iOS (Safari):** przycisk „Udostępnij” → „Dodaj do ekranu początkowego”.
4. Aplikacja pojawi się jako ikona na ekranie głównym telefonu i będzie uruchamiać się w trybie pełnoekranowym, jak natywna aplikacja.
5. Po pierwszym załadowaniu aplikacja działa również **offline** — dane czasowników i cały interfejs są zapisane w cache przez service workera.

## Struktura projektu

```
src/
  types/       — definicje TypeScript (gramatyka, czasowniki, quiz)
  data/        — dane czasowników (55 pozycji), zaimków i czasów
  lib/         — logika: generator pytań, sprawdzanie odpowiedzi, localStorage, silnik quizu
  hooks/       — useQuizSession spinający logikę z komponentami
  components/  — ekrany: Quiz, Wyniki, Ustawienia, Lista/Szczegóły czasowników
```

Zobacz komentarze w `src/types/` i `src/data/` — dodanie nowego czasownika, czasu gramatycznego lub typu zaimka wymaga jedynie rozszerzenia danych, bez zmian w logice aplikacji.

## Dodawanie nowego czasownika

Wpisy żyją w `src/data/verbs.ts`, w tablicy `VERBS`. Każdy wpis wymaga: `id`, `infinitive`, `regular`, `participle`, odmiany hiszpańskiej (`conjugations`), tłumaczeń dla każdego języka z `src/data/languages.ts` (`translations.pl/en/de`) oraz co najmniej kilku ręcznie napisanych przykładowych zdań (`examples`).

**Czasownik w pełni regularny** (odmiana -ar/-er/-ir bez żadnych wyjątków ortograficznych ani rdzennych, np. `hablar`, `comer`, `vivir`) — nie wpisuj odmiany hiszpańskiej ręcznie, tylko użyj generatora:

```ts
import { conjugateRegular } from './verbTemplates'

{
  id: 'cantar',
  infinitive: 'cantar',
  regular: true,
  participle: 'cantado',
  conjugations: conjugateRegular('cantar'),
  translations: { /* ... */ },
  examples: [ /* ... */ ],
}
```

`conjugateRegular` wyprowadza wszystkie 5 czasów × 6 osób z samego bezokolicznika. Jeśli czasownik ma jakąkolwiek nieregularność (zmianę rdzenia, ortografii, nieregularny participio itp.), wpisz `conjugations` ręcznie jak dotychczas, tak jak robią to istniejące czasowniki `regular: false`.

Tłumaczenia (`translations.pl/en/de`) i przykłady (`examples`) zawsze wpisuje się ręcznie — wymagają wiedzy językowej, której nie da się bezpiecznie wygenerować automatycznie.

Jeśli zdanie ma więcej niż jedną naturalną poprawną odpowiedź po hiszpańsku (np. "creo eso" i "lo creo" dla "I believe that."), dodaj do przykładu opcjonalne pole `alternativeAnswers: string[]` z pozostałymi wariantami — `spanish` zostaje wariantem głównym pokazywanym jako pierwszy, a quiz zaakceptuje każdy z nich jako poprawną odpowiedź.

Po dodaniu lub edycji czasownika uruchom:

```bash
npm run validate:verbs
```

Skrypt sprawdza, czy wpis ma komplet odmian (wszystkie czasy × wszystkie osoby), tłumaczenia dla każdego zarejestrowanego języka oraz unikalne identyfikatory — i wypisuje dokładnie, czego brakuje, zamiast przeglądać ręcznie kilka tysięcy linii `verbs.ts`.
