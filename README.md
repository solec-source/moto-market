# 🏎️ MotoMarket — Portal Sprzedaży Samochodów & Notatnik Analityczny

[![GitHub Repository](https://img.shields.io/badge/GitHub-solec--source%2Fmoto--market-blue?logo=github)](https://github.com/solec-source/moto-market)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-orange?logo=jupyter)](analiza_sprzedazy_aut.ipynb)
[![HTML5 & CSS3](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-green)](index.html)

Nowoczesny, kompleksowy projekt łączący **interaktywny portal internetowy komisu / salonu samochodowego** oraz **analityczny notatnik Jupyter** do eksploracji danych rynkowych i wyceny aut za pomocą uczenia maszynowego (Machine Learning).

---

## 📁 Zawartość Repozytorium

```
moto-market/
│
├── 🌐 index.html                 # Główna strona internetowa portalu MotoMarket
├── 🎨 styles.css                 # Stylizacja UI w nowoczesnym stylu automotive dark & blue
├── ⚡ app.js                     # Dynamiczna logika: katalog aut, filtry, wycena, kalkulator leasingu
├── 📊 cars_data.csv              # Baza danych ofert samochodowych (30 bogatych rekordów)
├── 📓 analiza_sprzedazy_aut.ipynb # Notatnik Jupyter z pełną analizą EDA i modelem Random Forest
├── 📦 requirements.txt           # Zależności Python do uruchomienia notatnika
├── 🚫 .gitignore                 # Ignorowanie plików środowisk wirtualnych i tymczasowych
└── 📖 README.md                  # Dokumentacja projektu
```

---

## 🚀 1. Strona Internetowa Portalu (`index.html`)

Interaktywna strona internetowa salonu i komisu aut używanych:

- **Szybkie wyszukiwanie i filtry**: Filtrowanie po marce (Audi, BMW, Toyota, Mercedes, etc.), typie nadwozia (SUV, Sedan, Kombi, Hatchback), rodzaju paliwa (Benzyna, Diesel, Hybryda, EV) oraz cenie maksymalnej.
- **Dynamiczny katalog aut**: Prezentacja ofert ze zdjęciami wysokiej jakości, plakietkami stanu (*Gwarancja 12m*, *1. Właściciel*), specyfikacją techniczną oraz ceną i orientacyjną ratą miesięczną.
- **Karty szczegółów pojazdu (Modal)**: Otwierane okno dialogowe z pełną specyfikacją, listą kluczowych elementów wyposażenia oraz przyciskiem natychmiastowej rezerwacji jazdy próbnej.
- **Kalkulator szybkiej wyceny online**: Użytkownik podaje parametry swojego auta i otrzymuje natychmiastowe widełki szacunkowej wartości rynkowej pojazdu.
- **Interaktywny kalkulator finansowania**: Dynamiczne suwaki wartości auta, wpłaty własnej (0% - 50%) oraz okresu finansowania (12 - 84 miesiące) z wyliczeniem raty netto/brutto i kwoty wykupu.
- **Opinie klientów, standardy gwarancyjne i formularz kontaktowy**: Pełna sekcja zaufania klienta oraz formularz rezerwacyjny z powiadomieniami Toast.

### Uruchomienie strony:
Możesz otworzyć plik `index.html` bezpośrednio w dowolnej przeglądarce internetowej (Google Chrome, Firefox, Edge, Safari):
- Podwójne kliknięcie w plik `index.html`, lub
- Uruchomienie lokalnego serwera:
  ```bash
  # Przykładowo z Node.js:
  npx serve .
  # lub z Pythonem:
  python -m http.server 8000
  ```

---

## 📓 2. Notatnik Jupyter (`analiza_sprzedazy_aut.ipynb`)

Profesjonalny notatnik analityczny w języku Python przygotowany pod kątem Data Science i Automotive Analytics.

### Zakres notatnika:
1. **Wczytanie i weryfikacja danych**: Analiza zbioru ofert `cars_data.csv`.
2. **Feature Engineering**: Kalkulacja wieku pojazdu, rocznego przebiegu oraz kategoryzacja marek segmentu premium.
3. **Eksploracyjna Analiza Danych (EDA)**:
   - Rozkład cen aut i statystyki opisowe,
   - Średnie ceny w podziale na marki i segmenty,
   - Krzywa deprecjacji (zależność ceny od wieku i przebiegu z linią trendu),
   - Analiza cen według rodzaju napędu (benzyna vs diesel vs hybryda/EV) i skrzyni biegów,
   - Macierz korelacji parametrów technicznych.
4. **Model Uczenia Maszynowego**:
   - Porównanie modeli `LinearRegression` oraz `RandomForestRegressor`,
   - Ewaluacja metryk: $R^2$, MAE (Mean Absolute Error) oraz RMSE,
   - Analiza istotności cech (*Feature Importance*) determinujących wartość pojazdu,
   - Wykres dopasowania cen rzeczywistych vs cen prognozowanych.
5. **Funkcja automatycznej wyceny (`wycen_auto`)**: Symulacja algorytmu wyceny pojazdów dla komisu.

### Uruchomienie notatnika:
```bash
# 1. Zainstaluj wymagane pakiety:
pip install -r requirements.txt

# 2. Uruchom serwer Jupyter:
jupyter notebook
```
Następnie otwórz plik `analiza_sprzedazy_aut.ipynb`.

---

## 🛠️ Technologie

- **Frontend**: HTML5, Semantic CSS3, Vanilla JavaScript (ES6+), Google Fonts (Plus Jakarta Sans, Space Grotesk)
- **Data Science**: Python 3, Pandas, NumPy, Matplotlib, Seaborn, Scikit-Learn, Jupyter Notebook
- **Wersjonowanie**: Git, GitHub

---

## 📄 Licencja

Projekt udostępniony na licencji [MIT](LICENSE).
Możesz swobodnie modyfikować i rozwijać kod pod własne potrzeby komisu lub portalu ogłoszeniowego.
