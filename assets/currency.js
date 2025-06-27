// Currency symbols
const currencySymbols = {
    'EUR': '€',
    'USD': '$',
    'UAH': '₴'
};

// Store exchange rates globally after fetching
let currentExchangeRates = {
    'EUR': 1, // Base currency is always 1
    'USD': 1, // Default values that will be updated
    'UAH': 1  // Default values that will be updated
};

// Function to fetch current exchange rates from your API endpoint
async function fetchExchangeRates() {
    try {
        // Use your backend API endpoint for exchange rates
        const response = await fetch('http://localhost:3000/api/exchange_rates');
        const data = await response.json();

        if (data && data.rates) {
            // Update rates with the latest data
            currentExchangeRates = {
                'EUR': 1, // Base currency
                'USD': data.rates.USD || currentExchangeRates.USD,
                'UAH': data.rates.UAH || currentExchangeRates.UAH
            };

            console.log('Exchange rates updated from API:', currentExchangeRates);

            // Update prices with new rates if a currency is already selected
            const currentCurrency = localStorage.getItem('preferredCurrency') || 'EUR';
            updatePrices(currentCurrency);

            // Store rates in localStorage with timestamp for caching
            const ratesCache = {
                timestamp: Date.now(),
                rates: currentExchangeRates
            };
            localStorage.setItem('exchangeRatesCache', JSON.stringify(ratesCache));
        }
    } catch (error) {
        console.error('Error fetching exchange rates from API:', error);
        // Use cached rates if available
        loadCachedRates();
    }
}

// Load cached rates from localStorage if API fails
function loadCachedRates() {
    const cachedData = localStorage.getItem('exchangeRatesCache');
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            if (parsed.rates) {
                currentExchangeRates = parsed.rates;
                console.log('Using cached exchange rates:', currentExchangeRates);
            }
        } catch (e) {
            console.error('Error parsing cached rates:', e);
        }
    }
}

// Function to update prices across the site
function updatePrices(currency) {
    const rate = currentExchangeRates[currency];
    const symbol = currencySymbols[currency];

    console.log(`Updating prices to ${currency} with rate ${rate} and symbol ${symbol}`);

    // Update prices on product listings
    document.querySelectorAll('.price').forEach(priceElement => {
        const basePrice = parseFloat(priceElement.getAttribute('data-price-eur'));
        if (!isNaN(basePrice)) {
            const convertedPrice = (basePrice * rate).toFixed(2); // Round to two decimal places
            priceElement.textContent = `${symbol}${convertedPrice}`;
        }
    });

    // Update price on tea details page if present
    const teaPriceElement = document.querySelector('.tea-price');
    if (teaPriceElement) {
        const basePrice = parseFloat(teaPriceElement.getAttribute('data-price-eur'));
        if (!isNaN(basePrice)) {
            const convertedPrice = (basePrice * rate).toFixed(2); // Round to two decimal places
            teaPriceElement.textContent = `${symbol}${convertedPrice}`;
        }
    }

    updateCartDisplayPrices(currency, rate, symbol);
    updateCheckoutDisplayPrices(currency, rate, symbol);
}

// Update prices in the shopping cart
function updateCartDisplayPrices(currency, rate, symbol) {
    document.querySelectorAll('.cart-item-price').forEach(el => {
        const basePrice = parseFloat(el.getAttribute('data-price-eur'));
        if (!isNaN(basePrice)) {
            el.textContent = `${symbol}${(basePrice * rate).toFixed(2)}`; // Round to two decimal places
        }
    });

    document.querySelectorAll('.cart-item-total').forEach(el => {
        const baseTotal = parseFloat(el.getAttribute('data-price-eur'));
        if (!isNaN(baseTotal)) {
            el.textContent = `${symbol}${(baseTotal * rate).toFixed(2)}`; // Round to two decimal places
        }
    });

    const cartTotalElement = document.querySelector('.cart-total-price');
    if (cartTotalElement) {
        const baseSubtotal = parseFloat(cartTotalElement.getAttribute('data-price-eur'));
        if (!isNaN(baseSubtotal)) {
            cartTotalElement.textContent = `${symbol}${(baseSubtotal * rate).toFixed(2)}`; // Round to two decimal places
        }
    }
}

// Update prices in the checkout page
function updateCheckoutDisplayPrices(currency, rate, symbol) {
    document.querySelectorAll('.order-item-price').forEach(el => {
        const basePrice = parseFloat(el.getAttribute('data-price-eur'));
        if (!isNaN(basePrice)) {
            el.textContent = `${symbol}${(basePrice * rate).toFixed(2)}`; // Round to two decimal places
        }
    });

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');

    [subtotalEl, shippingEl, totalEl].forEach(el => {
        if (el) {
            const base = parseFloat(el.getAttribute('data-price-eur'));
            if (!isNaN(base)) {
                el.textContent = `${symbol}${(base * rate).toFixed(2)}`; // Round to two decimal places
            }
        }
    });
}

// Check if we need to fetch new rates or can use cached ones
function initializeExchangeRates() {
    const cachedData = localStorage.getItem('exchangeRatesCache');

    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            const now = Date.now();
            const cacheAge = now - parsed.timestamp;

            // Use cached rates if less than 6 hours old (matching your server refresh rate)
            if (cacheAge < 6 * 60 * 60 * 1000 && parsed.rates) {
                currentExchangeRates = parsed.rates;
                console.log('Using cached exchange rates:', currentExchangeRates);

                // Still apply the saved currency preference
                const savedCurrency = localStorage.getItem('preferredCurrency') || 'EUR';
                updatePrices(savedCurrency);
                return;
            }
        } catch (e) {
            console.error('Error reading cached rates:', e);
        }
    }

    // Fetch fresh rates if cache is invalid or expired
    fetchExchangeRates();
}

// Helper function to get current currency info
function getCurrentCurrencyInfo() {
    const currency = localStorage.getItem('preferredCurrency') || 'EUR';
    const rate = currentExchangeRates[currency] || 1;
    const symbol = currencySymbols[currency] || '€';

    return { currency, rate, symbol };
}

// Initialize currency handling when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing currency handling');

    const currencySelector = document.getElementById('currency-selector');
    if (!currencySelector) {
        console.error('Currency selector not found in DOM');
        return;
    }

    // Load saved currency preference from localStorage
    const savedCurrency = localStorage.getItem('preferredCurrency') || 'EUR';
    console.log('Loaded saved currency preference:', savedCurrency);
    currencySelector.value = savedCurrency;

    // Initialize exchange rates (from cache or API)
    initializeExchangeRates();

    // Add event listener to currency selector
    currencySelector.addEventListener('change', () => {
        const selectedCurrency = currencySelector.value;
        console.log('Currency changed to:', selectedCurrency);

        // Save the selected currency to localStorage
        localStorage.setItem('preferredCurrency', selectedCurrency);

        // Update prices with the newly selected currency
        updatePrices(selectedCurrency);
    });
});

// Expose functions for use in other scripts
window.updatePrices = updatePrices;
window.getCurrentCurrencyInfo = getCurrentCurrencyInfo;

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updatePrices,
        fetchExchangeRates,
        getCurrentCurrencyInfo,
        currencySymbols,
        currentExchangeRates
    };
}