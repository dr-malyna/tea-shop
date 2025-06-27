document.addEventListener('DOMContentLoaded', function () {
    const filterIcon = document.querySelector('.filter-icon');
    const filterOptions = document.querySelector('.filter-options');
    const currencySelector = document.getElementById('currency-selector');
    let currentCurrency = localStorage.getItem('preferredCurrency') || 'EUR';

    // Initialize exchange rates
    initializeExchangeRates();

    if (currencySelector) {
        currencySelector.value = currentCurrency;

        // Update prices dynamically when the currency is changed
        currencySelector.addEventListener('change', () => {
            currentCurrency = currencySelector.value;
            localStorage.setItem('preferredCurrency', currentCurrency);
            updateTeaPrices(); // Update tea prices immediately
        });
    }

    if (filterIcon && filterOptions) {
        filterIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            filterOptions.classList.toggle('hidden');
        });

        filterOptions.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        document.addEventListener('click', () => {
            filterOptions.classList.add('hidden');
        });
    }

    const currentPage = window.location.pathname;
    let teaType = '';

    if (currentPage.includes('white-tea')) {
        teaType = 'White Tea';
    } else if (currentPage.includes('green-tea')) {
        teaType = 'green';
    } else if (currentPage.includes('oolong')) {
        teaType = 'oolong';
    } else if (currentPage.includes('black-tea')) {
        teaType = 'black';
    } else if (currentPage.includes('puerh')) {
        teaType = 'puerh';
    } else if (currentPage.includes('matcha')) {
        teaType = 'matcha';
    } else {
        console.log('Tea type not recognized');
        return;
    }

    populateCountryFilter();
    fetchExchangeRates(); // Fetch exchange rates on page load

    const countryFilter = document.getElementById('country-filter');
    const priceFilter = document.getElementById('price-filter');

    if (countryFilter && priceFilter) {
        countryFilter.addEventListener('change', () => loadTeas(teaType));
        priceFilter.addEventListener('change', () => loadTeas(teaType));
    }

    loadTeas(teaType);

    function populateCountryFilter() {
        const countryFilter = document.getElementById('country-filter');

        countryFilter.innerHTML = '<option value="">All</option>';

        fetch('https://restcountries.com/v3.1/all')
            .then(response => response.json())
            .then(data => {
                const countries = data
                    .map(country => country.name.common)
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b));

                countries.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country;
                    option.textContent = country;
                    countryFilter.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Failed to fetch countries:', error);
            });
    }

    function fetchExchangeRates() {
        fetch('https://api.exchangerate-api.com/v4/latest/EUR') // Replace with your API if needed
            .then(response => response.json())
            .then(data => {
                if (data && data.rates) {
                    currentExchangeRates = {
                        EUR: 1,
                        USD: data.rates.USD || 1,
                        UAH: data.rates.UAH || 1
                    };
                    console.log('Exchange rates updated:', currentExchangeRates);
                }
            })
            .catch(error => {
                console.error('Failed to fetch exchange rates:', error);
            });
    }

    function loadTeas(teaType) {
        const teaContainer = document.getElementById('tea-products-container');
        const countryFilter = document.getElementById('country-filter');
        const priceFilter = document.getElementById('price-filter');

        teaContainer.innerHTML = '<div class="loader">Loading...</div>';

        const apiUrl = `http://localhost:3000/api/items/category/${teaType}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(teas => {
                teaContainer.innerHTML = '';

                if (teas.length === 0) {
                    teaContainer.innerHTML = `<p>No ${teaType} teas found in the database.</p>`;
                    return;
                }

                const selectedCountry = countryFilter?.value || '';
                const selectedPrice = priceFilter?.value || '';

                let filteredTeas = teas;

                if (selectedCountry) {
                    filteredTeas = filteredTeas.filter(tea =>
                        tea.origin && tea.origin.toLowerCase().includes(selectedCountry.toLowerCase())
                    );
                }

                if (selectedPrice) {
                    filteredTeas = filteredTeas.filter(tea => {
                        const price = parseFloat(tea.price_50g);
                        if (selectedPrice === 'under-10') return price < 10;
                        if (selectedPrice === '10-20') return price >= 10 && price <= 20;
                        if (selectedPrice === '20-plus') return price > 20;
                        return true;
                    });
                }

                if (filteredTeas.length === 0) {
                    teaContainer.innerHTML = `<p>No teas match your filters.</p>`;
                    return;
                }

                filteredTeas.forEach(tea => {
                    const detailUrl = `tea-details.html?id=${tea.id}`;
                    const basePriceEUR = parseFloat(tea.price_50g);
                    const convertedPrice = (basePriceEUR * currentExchangeRates[currentCurrency]).toFixed(2);
                    const currencySymbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'USD' ? '$' : '₴';

                    const teaHTML = `
                        <div class="tea-item-container">
                            <div class="tea-item">
                                <a href="${detailUrl}">
                                    <img src="${tea.image_path}" alt="${tea.name}">
                                </a>
                            </div>
                            <p class="tea-origin">${tea.origin}</p>
                            <p class="tea-name">
                                <a href="${detailUrl}" style="text-decoration: none; color: inherit;">
                                    ${tea.name}
                                </a>
                            </p>
                            <p class="tea-price" data-price-eur="${basePriceEUR}">
                                From <span class="price-value">${currencySymbol}${convertedPrice}</span>
                            </p>
                        </div>
                    `;
                    teaContainer.innerHTML += teaHTML;
                });

                // Update prices dynamically after loading teas
                updateTeaPrices();
            })
            .catch(error => {
                console.error('Error fetching teas:', error);
                teaContainer.innerHTML = `
                    <p>Failed to load teas. Please try again later.</p>
                    <p>Error: ${error.message}</p>
                `;
            });
    }

    function updateTeaPrices() {
        const teaPriceElements = document.querySelectorAll('.tea-price');

        teaPriceElements.forEach(priceElement => {
            const basePrice = parseFloat(priceElement.getAttribute('data-price-eur'));
            if (!isNaN(basePrice)) {
                const convertedPrice = (basePrice * currentExchangeRates[currentCurrency]).toFixed(2);
                const currencySymbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'USD' ? '$' : '₴';
                const priceValueSpan = priceElement.querySelector('.price-value');

                if (priceValueSpan) {
                    priceValueSpan.textContent = `${currencySymbol}${convertedPrice}`;
                } else {
                    // fallback in case .price-value doesn't exist
                    priceElement.textContent = `From ${currencySymbol}${convertedPrice}`;
                }
            }
        });
    }
});