# Dokumentacja systemu — polski

## Część A — Techniczny opis systemu

### Cel i zakres
Nexus Contextual Knowledge Graph Engine to rozwijane środowisko oparte na grafie, służące do opisywania obiektów i relacji, zachowywania kontekstu źródeł i dowodów, sprawdzania importowanych danych oraz łączenia większych obszarów wiedzy za pomocą artefaktów wyższego poziomu. Repozytorium zawiera obecnie aplikację HTML/React w jednym pliku oraz moduły walidacji JavaScript, dane testowe JSON, schematy, testy i automatyzację GitHub Actions.

### Warstwy
1. **Graf kanoniczny:** węzły i krawędzie przedstawiają obiekty oraz relacje. Należy zachowywać identyfikatory i atrybuty podczas obsługiwanych operacji importu i eksportu.
2. **Walidacja i wymiana danych:** kontrola struktury, odzyskiwanie zapisanego stanu, tryby importu oraz testy formatów. CSV obsługuje pola w cudzysłowach, podwojone cudzysłowy i znaki nowej linii wewnątrz pól. Importer Cypher obsługuje ograniczony podzbiór oparty na wyrażeniach regularnych; nie jest pełnym parserem Cypher.
3. **Korpus źródeł i dowodów:** oddzielne rekordy źródeł i prac, autorów/wydawców, twierdzeń oraz powiązań dowodowych. Dowód może dotyczyć węzła, krawędzi, twierdzenia lub skierowanej ścieżki węzeł–krawędź–węzeł. Źródło, twierdzenie, stanowisko dowodu, wiarygodność źródła i pewność ekstrakcji to odrębne pojęcia.
4. **Warstwa artefaktów sieciowych wyższego poziomu:** wersjonowane artefakty grupują typowane odwołania do węzłów, krawędzi, twierdzeń, źródeł, dowodów, kontekstów i innych artefaktów. Łącza między artefaktami opisują relacje, np. zawiera, nakłada się, nadaje kontekst, zaprzecza lub zależy od. Określenie „neuralna” oznacza obecnie koncepcję modelowania sieci wyższego poziomu; nie oznacza, że wdrożono wytrenowaną sieć neuronową.
5. **Testy i automatyzacja:** testy Node.js i GitHub Actions kontrolują zgodność danych z obsługiwanymi kontraktami.

### Pochodzenie danych i niepewność
Tożsamość obiektu kanonicznego musi być oddzielona od jego członkostwa w artefakcie. W miarę możliwości zapisuj pochodzenie, wersję, metodę wyprowadzenia, migawki danych wejściowych, zakres czasu i kontekstu oraz odwołania do dowodów. Podobieństwo, trafność, waga krawędzi, pewność, wiarygodność źródła, stanowisko dowodu i prawdziwość nie mogą być sprowadzane do jednej miary. Syntetyczne dane testowe nie są rzeczywistymi źródłami.

### Stan implementacji
W bieżącej gałęzi przygotowano walidację grafu i testy, archiwum kanoniczne oraz przykłady importu, schemat i przykładowe rekordy korpusu źródeł/dowodów, a także projekt warstwy artefaktów, schemat, przykłady i testy integralności. Edytor źródeł w interfejsie, eksplorator artefaktów, szeroki import źródeł oraz rzeczywiste wnioskowanie sieci neuronowej/embeddingów pozostają planami. Przed stwierdzeniem, że najnowsza wersja przechodzi testy, sprawdź aktualny status GitHub Actions.

## Część B — Przewodnik prostym językiem

Nexus to projekt porządkowania informacji jako połączonych elementów. Węzeł oznacza rzecz lub pojęcie, a krawędź pokazuje relację między elementami. System ma też przechowywać źródła i dowody wyjaśniające, skąd pochodzi dana informacja, oraz większe zbiory powiązanych elementów, nazywane artefaktami.

Przykładowy artefakt może łączyć raport, temat, relację między nimi i źródła omawiające tę relację. Artefakty mogą łączyć się z innymi artefaktami, dzięki czemu łatwiej poruszać się po dużej ilości informacji bez wielokrotnego kopiowania tych samych danych.

System nadal powstaje. Istnieją już niektóre kontrole danych, przykładowe rekordy, schematy i testy. Pełny edytor wizualny, automatyczne odkrywanie grup oraz analiza za pomocą rzeczywistej sieci neuronowej nie są jeszcze gotowe. Przykłady oznaczone jako syntetyczne służą demonstracji, a nie potwierdzaniu faktów.

Przy każdej informacji warto osobno zapytać: co zapisano, jakie źródło to wspiera i jak pewna jest interpretacja? System powinien zachowywać rozbieżności i niepewność, zamiast je ukrywać.

## Nowy etap ładowania zbioru danych

Moduł wczytuje razem graf, źródła, twierdzenia, odnośniki do dowodów, artefakty i relacje między artefaktami, a następnie sprawdza odwołania i tworzy indeksy wyszukiwania. Zgłasza brakujące pliki i uszkodzone odwołania zamiast po cichu je akceptować. To funkcja ładowania i kontroli spójności danych, a nie sieć neuronowa, która uczy się lub dowodzi faktów.

Prościej: system ma teraz wielokrotnego użytku sposób zebrania powiązanych rekordów i sprawdzenia, czy ich odnośniki prowadzą do istniejących rekordów, zanim użyje ich inna część aplikacji. Moduł nie jest jeszcze podłączony do interfejsu przeglądarkowego.


## Aktualizacja modułu ładowania danych

Moduł łączy rekordy grafu, źródeł, twierdzeń, dowodów i artefaktów w jeden sprawdzony zestaw z indeksami wyszukiwania. Zgłasza brakujące pliki i uszkodzone odwołania. To kontrola spójności danych, a nie sieć neuronowa ucząca się lub dowodząca faktów; moduł nie jest jeszcze podłączony do interfejsu przeglądarkowego.

## Aktualizacja: przechodzenie po powiązaniach

Kod zawiera teraz ograniczony mechanizm przechodzenia po korpusie, który zaczyna od typowanego odwołania, takiego jak węzeł, krawędź, źródło, twierdzenie, odnośnik dowodowy lub artefakt. Zwraca osiągalne rekordy oraz ścieżki zachowujące typy relacji i dostępne odwołania do dowodów. Głębokość i liczba wyników są ograniczone. To deterministyczne przechodzenie po grafie, a nie wnioskowanie sieci neuronowej ani dowód prawdziwości; funkcja nie jest jeszcze podłączona do interfejsu przeglądarkowego.
