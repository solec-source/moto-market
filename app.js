/**
 * MotoMarket - Portal Samochodowy & Komis Online
 * Dynamic JavaScript Controller
 */

// Baza danych pojazdów (fallback gdyby strona była otwierana z protokołu file://)
const defaultCars = [
  {
    id: 1,
    brand: "BMW",
    model: "Seria 3 320d xDrive M-Sport",
    year: 2021,
    mileage_km: 68000,
    fuel_type: "Diesel",
    engine_capacity_l: 2.0,
    power_hp: 190,
    gearbox: "Automatyczna",
    price_pln: 149900,
    body_type: "Sedan",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 18,
    image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    brand: "Audi",
    model: "A4 Avant 40 TDI quattro",
    year: 2020,
    mileage_km: 89000,
    fuel_type: "Diesel",
    engine_capacity_l: 2.0,
    power_hp: 204,
    gearbox: "Automatyczna",
    price_pln: 138500,
    body_type: "Kombi",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 24,
    image_url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    brand: "Mercedes-Benz",
    model: "Klasa C C200 AMG Line",
    year: 2022,
    mileage_km: 34000,
    fuel_type: "Hybryda",
    engine_capacity_l: 1.5,
    power_hp: 204,
    gearbox: "Automatyczna",
    price_pln: 189000,
    body_type: "Sedan",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 12,
    image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    brand: "Toyota",
    model: "Corolla TS Kombi 1.8 Hybrid",
    year: 2022,
    mileage_km: 42000,
    fuel_type: "Hybryda",
    engine_capacity_l: 1.8,
    power_hp: 122,
    gearbox: "Automatyczna",
    price_pln: 98500,
    body_type: "Kombi",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 15,
    image_url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    brand: "Volkswagen",
    model: "Golf 8 1.5 eTSI Style",
    year: 2021,
    mileage_km: 55000,
    fuel_type: "Benzyna",
    engine_capacity_l: 1.5,
    power_hp: 150,
    gearbox: "Automatyczna",
    price_pln: 92000,
    body_type: "Hatchback",
    first_owner: "Nie",
    accident_free: "Tak",
    days_to_sell: 29,
    image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    brand: "Skoda",
    model: "Octavia Combi 2.0 TDI RS",
    year: 2021,
    mileage_km: 79000,
    fuel_type: "Diesel",
    engine_capacity_l: 2.0,
    power_hp: 200,
    gearbox: "Automatyczna",
    price_pln: 127000,
    body_type: "Kombi",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 21,
    image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 7,
    brand: "Volvo",
    model: "XC60 B4 AWD Momentum",
    year: 2020,
    mileage_km: 95000,
    fuel_type: "Hybryda",
    engine_capacity_l: 2.0,
    power_hp: 197,
    gearbox: "Automatyczna",
    price_pln: 159000,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 32,
    image_url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    brand: "Ford",
    model: "Focus ST-Line 1.0 EcoBoost",
    year: 2020,
    mileage_km: 72000,
    fuel_type: "Benzyna",
    engine_capacity_l: 1.0,
    power_hp: 125,
    gearbox: "Manualna",
    price_pln: 69900,
    body_type: "Hatchback",
    first_owner: "Nie",
    accident_free: "Tak",
    days_to_sell: 35,
    image_url: "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 9,
    brand: "Kia",
    model: "Sportage 1.6 T-GDI MHEV",
    year: 2022,
    mileage_km: 31000,
    fuel_type: "Hybryda",
    engine_capacity_l: 1.6,
    power_hp: 150,
    gearbox: "Automatyczna",
    price_pln: 124900,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 14,
    image_url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 10,
    brand: "Hyundai",
    model: "Tucson 1.6 T-GDI Hybrid N Line",
    year: 2023,
    mileage_km: 19000,
    fuel_type: "Hybryda",
    engine_capacity_l: 1.6,
    power_hp: 230,
    gearbox: "Automatyczna",
    price_pln: 154000,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 9,
    image_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 11,
    brand: "Tesla",
    model: "Model 3 Long Range AWD",
    year: 2022,
    mileage_km: 48000,
    fuel_type: "Elektryczny",
    engine_capacity_l: 0.0,
    power_hp: 440,
    gearbox: "Automatyczna",
    price_pln: 159900,
    body_type: "Sedan",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 19,
    image_url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 12,
    brand: "BMW",
    model: "X5 xDrive30d M Sport",
    year: 2019,
    mileage_km: 118000,
    fuel_type: "Diesel",
    engine_capacity_l: 3.0,
    power_hp: 265,
    gearbox: "Automatyczna",
    price_pln: 229000,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 27,
    image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 13,
    brand: "Audi",
    model: "Q5 45 TFSI quattro S Line",
    year: 2021,
    mileage_km: 52000,
    fuel_type: "Benzyna",
    engine_capacity_l: 2.0,
    power_hp: 265,
    gearbox: "Automatyczna",
    price_pln: 179900,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 22,
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 14,
    brand: "Toyota",
    model: "RAV4 2.5 Hybrid Selection AWD",
    year: 2021,
    mileage_km: 61000,
    fuel_type: "Hybryda",
    engine_capacity_l: 2.5,
    power_hp: 222,
    gearbox: "Automatyczna",
    price_pln: 139000,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 16,
    image_url: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 15,
    brand: "Porsche",
    model: "Macan GTS 2.9 V6",
    year: 2020,
    mileage_km: 58000,
    fuel_type: "Benzyna",
    engine_capacity_l: 2.9,
    power_hp: 380,
    gearbox: "Automatyczna",
    price_pln: 319000,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 17,
    image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 16,
    brand: "Cupra",
    model: "Formentor 2.0 TSI VZ 4Drive",
    year: 2022,
    mileage_km: 29000,
    fuel_type: "Benzyna",
    engine_capacity_l: 2.0,
    power_hp: 310,
    gearbox: "Automatyczna",
    price_pln: 168000,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 11,
    image_url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 17,
    brand: "BMW",
    model: "Seria 5 530i xDrive M Sport",
    year: 2020,
    mileage_km: 78000,
    fuel_type: "Benzyna",
    engine_capacity_l: 2.0,
    power_hp: 252,
    gearbox: "Automatyczna",
    price_pln: 179000,
    body_type: "Sedan",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 23,
    image_url: "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 18,
    brand: "Mercedes-Benz",
    model: "GLC 220d 4MATIC Coupé",
    year: 2021,
    mileage_km: 54000,
    fuel_type: "Diesel",
    engine_capacity_l: 2.0,
    power_hp: 194,
    gearbox: "Automatyczna",
    price_pln: 215000,
    body_type: "SUV",
    first_owner: "Tak",
    accident_free: "Tak",
    days_to_sell: 13,
    image_url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
  }
];

let allCars = [...defaultCars];
let activeCategory = "all";

// Formatowanie waluty PLN
function formatPLN(amount) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(amount);
}

// Formatowanie przebiegu
function formatKm(km) {
  return new Intl.NumberFormat('pl-PL').format(km) + ' km';
}

// Obliczenie orientacyjnej raty leasingu (48 msc, 20% wpłaty)
function calcInstallment(price) {
  const deposit = price * 0.2;
  const financed = price - deposit;
  const months = 48;
  const interestRate = 0.075 / 12;
  const monthly = (financed * interestRate) / (1 - Math.pow(1 + interestRate, -months));
  return Math.round(monthly);
}

// Inicjalizacja danych z pliku CSV jeśli dostępny
async function loadCarsData() {
  try {
    const response = await fetch('cars_data.csv');
    if (response.ok) {
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim());
        const parsedCars = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= headers.length) {
            const car = {};
            headers.forEach((h, index) => {
              let val = values[index];
              if (['id', 'year', 'mileage_km', 'power_hp', 'price_pln', 'days_to_sell'].includes(h)) {
                val = parseInt(val, 10);
              } else if (h === 'engine_capacity_l') {
                val = parseFloat(val);
              }
              car[h] = val;
            });
            parsedCars.push(car);
          }
        }
        if (parsedCars.length > 0) {
          allCars = parsedCars;
        }
      }
    }
  } catch (e) {
    console.log("Ładowanie lokalnej bazy domyślnej:", e);
  }
  renderCars();
}

// Renderowanie kart pojazdów
function renderCars() {
  const container = document.getElementById('carsGrid');
  const emptyState = document.getElementById('emptyState');
  const carCountEl = document.getElementById('carCount');

  const filtered = getFilteredCars();
  carCountEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  container.innerHTML = filtered.map(car => {
    const monthly = calcInstallment(car.price_pln);
    return `
      <article class="car-card" data-id="${car.id}">
        <div class="card-image-box">
          <img src="${car.image_url}" alt="${car.brand} ${car.model}" loading="lazy">
          <div class="card-badges">
            <span class="badge badge-guarantee">🛡️ Gwarancja 12m</span>
            ${car.first_owner === 'Tak' ? '<span class="badge badge-owner">1. Właściciel</span>' : ''}
          </div>
          <span class="badge-fuel">${car.fuel_type}</span>
        </div>

        <div class="card-content">
          <h3 class="card-brand-model">${car.brand} ${car.model}</h3>

          <div class="card-specs-row">
            <div class="spec-item">
              <div class="spec-title">Rok</div>
              <div class="spec-value">${car.year}</div>
            </div>
            <div class="spec-item">
              <div class="spec-title">Przebieg</div>
              <div class="spec-value">${Math.round(car.mileage_km / 1000)}k km</div>
            </div>
            <div class="spec-item">
              <div class="spec-title">Moc</div>
              <div class="spec-value">${car.power_hp} KM</div>
            </div>
            <div class="spec-item">
              <div class="spec-title">Skrzynia</div>
              <div class="spec-value">${car.gearbox === 'Automatyczna' ? 'Automat' : 'Manual'}</div>
            </div>
          </div>

          <div class="card-footer">
            <div class="price-box">
              <span class="price-main">${formatPLN(car.price_pln)}</span>
              <span class="price-installment">lub od <span>${formatPLN(monthly)}</span> / mies.</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="openCarModal(${car.id})">
              Szczegóły
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Filtrowanie i sortowanie
function getFilteredCars() {
  const query = document.getElementById('textSearchInput').value.toLowerCase().trim();
  const sort = document.getElementById('sortBySelect').value;
  const quickBrand = document.getElementById('filterBrandQuick').value;
  const quickBody = document.getElementById('filterBodyQuick').value;
  const quickFuel = document.getElementById('filterFuelQuick').value;
  const quickMaxPrice = parseFloat(document.getElementById('filterMaxPriceQuick').value) || Infinity;

  let result = allCars.filter(car => {
    // Wyszukiwarka tekstowa
    if (query) {
      const match = `${car.brand} ${car.model} ${car.body_type}`.toLowerCase();
      if (!match.includes(query)) return false;
    }

    // Kategoria (pills)
    if (activeCategory === 'SUV' && car.body_type !== 'SUV') return false;
    if (activeCategory === 'Sedan' && car.body_type !== 'Sedan') return false;
    if (activeCategory === 'Kombi' && car.body_type !== 'Kombi') return false;
    if (activeCategory === 'Hybryda' && !['Hybryda', 'Elektryczny'].includes(car.fuel_type)) return false;
    if (activeCategory === 'under100k' && car.price_pln > 100000) return false;

    // Szybkie filtry z Hero
    if (quickBrand && car.brand !== quickBrand) return false;
    if (quickBody && car.body_type !== quickBody) return false;
    if (quickFuel && car.fuel_type !== quickFuel) return false;
    if (car.price_pln > quickMaxPrice) return false;

    return true;
  });

  // Sortowanie
  if (sort === 'price-asc') {
    result.sort((a, b) => a.price_pln - b.price_pln);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.price_pln - a.price_pln);
  } else if (sort === 'year-desc') {
    result.sort((a, b) => b.year - a.year);
  } else if (sort === 'mileage-asc') {
    result.sort((a, b) => a.mileage_km - b.mileage_km);
  }

  return result;
}

// Otwieranie modalu ze szczegółami
window.openCarModal = function(carId) {
  const car = allCars.find(c => c.id === carId);
  if (!car) return;

  const modal = document.getElementById('carModal');
  const modalContent = document.getElementById('modalContent');
  const monthly = calcInstallment(car.price_pln);

  modalContent.innerHTML = `
    <img src="${car.image_url}" alt="${car.brand} ${car.model}" class="modal-hero-img">
    <div class="modal-details">
      <div class="modal-header-row">
        <div>
          <span class="badge badge-guarantee">Pojazd z certyfikatem DEKRA</span>
          <h2 class="modal-title" style="margin-top: 8px;">${car.brand} ${car.model}</h2>
        </div>
        <div class="text-right">
          <div class="modal-price">${formatPLN(car.price_pln)}</div>
          <div style="font-size: 0.88rem; color: #64748b;">Rata od ${formatPLN(monthly)} netto/mc</div>
        </div>
      </div>

      <table class="modal-specs-table">
        <tbody>
          <tr>
            <td>Rok produkcji</td>
            <td><strong>${car.year}</strong></td>
          </tr>
          <tr>
            <td>Przebieg</td>
            <td><strong>${formatKm(car.mileage_km)}</strong></td>
          </tr>
          <tr>
            <td>Paliwo i silnik</td>
            <td><strong>${car.fuel_type} • ${car.engine_capacity_l > 0 ? car.engine_capacity_l + 'L' : 'Napęd elektryczny'} (${car.power_hp} KM)</strong></td>
          </tr>
          <tr>
            <td>Skrzynia biegów</td>
            <td><strong>${car.gearbox}</strong></td>
          </tr>
          <tr>
            <td>Typ nadwozia</td>
            <td><strong>${car.body_type}</strong></td>
          </tr>
          <tr>
            <td>Historia pojazdu</td>
            <td><strong>${car.first_owner === 'Tak' ? 'Pierwszy właściciel' : 'Drugi właściciel'}, ${car.accident_free === 'Tak' ? '100% Bezwypadkowy' : 'Po drobnej naprawie'}</strong></td>
          </tr>
          <tr>
            <td>Gwarancja techniczna</td>
            <td><strong>12 miesięcy w cenie pojazdu (z możliwością przedłużenia do 24m)</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="modal-equipment">
        <h4>Wyposażenie kluczowe:</h4>
        <ul class="equipment-list">
          <li>✓ Reflektory adaptacyjne LED Matrix</li>
          <li>✓ Wirtualny kokpit / Cyfrowe zegary</li>
          <li>✓ Asystent pasa ruchu i martwego pola</li>
          <li>✓ Kamera cofania z czujnikami 360°</li>
          <li>✓ Apple CarPlay & Android Auto</li>
          <li>✓ Podgrzewane fotele przednie</li>
          <li>✓ Tempomat adaptacyjny ACC</li>
          <li>✓ Dwustrefowa klimatyzacja automatyczna</li>
        </ul>
      </div>

      <div class="modal-actions">
        <a href="#kontakt" onclick="prefillContactForm('${car.brand} ${car.model}'); closeModal();" class="btn btn-primary btn-block">
          Zarezerwuj Jazdę Próbną
        </a>
        <button onclick="setFinancingPrice(${car.price_pln}); closeModal();" class="btn btn-secondary">
          Oblicz Leasing
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  const modal = document.getElementById('carModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// Pomocnik bezpośredniego filtrowania z footera
window.filterByBrandDirect = function(brand) {
  document.getElementById('filterBrandQuick').value = brand;
  document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' });
  renderCars();
};

// Ustawienie ceny w kalkulatorze finansowania z modalu
window.setFinancingPrice = function(price) {
  const priceRange = document.getElementById('calcPriceRange');
  priceRange.value = price;
  updateFinancingCalculator();
  document.getElementById('kalkulator').scrollIntoView({ behavior: 'smooth' });
};

// Wypełnienie formularza kontaktowego modelem auta
window.prefillContactForm = function(modelName) {
  const msgInput = document.getElementById('contactMessage');
  msgInput.value = `Dzień dobry, proszę o kontakt i rezerwację jazdy próbnej dla modelu: ${modelName}.`;
};

// Kalkulator finansowania
function updateFinancingCalculator() {
  const price = parseFloat(document.getElementById('calcPriceRange').value);
  const depositPercent = parseFloat(document.getElementById('calcDepositRange').value);
  const months = parseInt(document.getElementById('calcMonthsRange').value, 10);

  const depositVal = (price * (depositPercent / 100));
  const buyoutVal = price * 0.15;
  const financed = price - depositVal;

  const annualRate = 0.082;
  const monthlyRate = annualRate / 12;
  const monthlyInstallment = ((financed - (buyoutVal / Math.pow(1 + monthlyRate, months))) * monthlyRate) / 
                             (1 - Math.pow(1 + monthlyRate, -months));

  document.getElementById('calcPriceVal').textContent = formatPLN(price);
  document.getElementById('calcDepositPercent').textContent = `${depositPercent}%`;
  document.getElementById('calcDepositVal').textContent = formatPLN(depositVal);
  document.getElementById('calcMonthsVal').textContent = `${months} miesięcy`;

  document.getElementById('calcMonthlyResult').innerHTML = 
    `${formatPLN(Math.round(monthlyInstallment))} <span class="netto">/ mies. netto</span>`;
  document.getElementById('calcFinancedAmount').textContent = formatPLN(financed);
  document.getElementById('calcBuyoutAmount').textContent = formatPLN(buyoutVal);
}

// Algorytm szacunkowej wyceny online
function estimateCarValuation(brand, year, mileage, fuel, condition) {
  const currentYear = 2026;
  const age = Math.max(0, currentYear - year);

  // Baza wyjściowa według segmentu marki
  const premiumBrands = ['BMW', 'Audi', 'Mercedes-Benz', 'Porsche', 'Volvo'];
  let basePrice = premiumBrands.includes(brand) ? 240000 : 130000;

  // Spadek wartości: ok. 10-14% rocznie
  let depreciationFactor = Math.pow(0.88, age);

  // Wpływ przebiegu (średnia 18 000 km/rok)
  const expectedMileage = age * 18000;
  const mileageDiff = mileage - expectedMileage;
  const mileageFactor = 1 - (mileageDiff / 250000) * 0.15;

  // Korekta paliwa
  let fuelMultiplier = 1.0;
  if (fuel === 'Hybryda') fuelMultiplier = 1.06;
  if (fuel === 'Elektryczny') fuelMultiplier = 0.95;

  // Korekta stanu
  let conditionMultiplier = 1.0;
  if (condition === 'idealny') conditionMultiplier = 1.05;
  if (condition === 'dobry') conditionMultiplier = 0.92;

  let estimated = basePrice * depreciationFactor * mileageFactor * fuelMultiplier * conditionMultiplier;
  estimated = Math.max(20000, estimated);

  const minRange = Math.round((estimated * 0.94) / 500) * 500;
  const maxRange = Math.round((estimated * 1.06) / 500) * 500;

  return { min: minRange, max: maxRange };
}

// Toast powiadomienie
function showToast(message) {
  const toast = document.getElementById('toastMessage');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Inicjalizacja nasłuchiwaczy zdarzeń
document.addEventListener('DOMContentLoaded', () => {
  loadCarsData();

  // Filtry pill
  document.getElementById('categoryPills').addEventListener('click', (e) => {
    if (e.target.classList.contains('pill')) {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.getAttribute('data-category');
      renderCars();
    }
  });

  // Wyszukiwarka live
  document.getElementById('textSearchInput').addEventListener('input', () => {
    renderCars();
  });

  // Sortowanie
  document.getElementById('sortBySelect').addEventListener('change', () => {
    renderCars();
  });

  // Przycisk szukania w Hero
  document.getElementById('btnQuickSearch').addEventListener('click', () => {
    document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' });
    renderCars();
  });

  // Reset filtrów
  document.getElementById('btnResetFilters').addEventListener('click', () => {
    document.getElementById('textSearchInput').value = '';
    document.getElementById('filterBrandQuick').value = '';
    document.getElementById('filterBodyQuick').value = '';
    document.getElementById('filterFuelQuick').value = '';
    document.getElementById('filterMaxPriceQuick').value = '';
    document.getElementById('sortBySelect').value = 'featured';
    activeCategory = 'all';
    document.querySelectorAll('.pill').forEach((p, idx) => {
      p.classList.toggle('active', idx === 0);
    });
    renderCars();
  });

  // Suwaki kalkulatora finansowania
  document.getElementById('calcPriceRange').addEventListener('input', updateFinancingCalculator);
  document.getElementById('calcDepositRange').addEventListener('input', updateFinancingCalculator);
  document.getElementById('calcMonthsRange').addEventListener('input', updateFinancingCalculator);
  updateFinancingCalculator();

  // Formularz wyceny
  const valuationForm = document.getElementById('valuationForm');
  valuationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const brand = document.getElementById('valBrand').value;
    const year = parseInt(document.getElementById('valYear').value, 10);
    const mileage = parseInt(document.getElementById('valMileage').value, 10);
    const fuel = document.getElementById('valFuel').value;
    const condition = document.getElementById('valCondition').value;

    const val = estimateCarValuation(brand, year, mileage, fuel, condition);

    const resultBox = document.getElementById('valuationResult');
    const display = document.getElementById('valPriceDisplay');
    display.textContent = `${formatPLN(val.min)} - ${formatPLN(val.max)}`;
    resultBox.style.display = 'block';
  });

  document.getElementById('btnBookInspection').addEventListener('click', () => {
    prefillContactForm('Oględziny i odkup pojazdu z wyceny online');
    document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth' });
  });

  // Formularz kontaktowy
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    showToast(`Dziękujemy ${name}! Twoja wiadomość została wysłana. Doradca skontaktuje się w ciągu 30 minut.`);
    e.target.reset();
  });

  // Modal events
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  mobileBtn.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.style.display === 'flex') {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '72px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = '#0f172a';
      navLinks.style.padding = '20px';
    }
  });
});
