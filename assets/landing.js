document.addEventListener("DOMContentLoaded", function () {
    console.log("Tea Shop Landing Page Loaded!");

    // Redirect to White Tea page on button click
    document.querySelector(".hero button").addEventListener("click", function () {
        window.location.href = "/pages/white-tea.html";
    });

    // Keep header fixed
    const header = document.querySelector('header');
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.width = '100%';
    header.style.zIndex = '1000';

    // Currency conversion functionality
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
            updateLandingPagePrices(); // Update prices immediately
        });
    }

    function updateLandingPagePrices() {
        const teaPriceElements = document.querySelectorAll('.tea-price');

        teaPriceElements.forEach(priceElement => {
            const basePrice = parseFloat(priceElement.getAttribute('data-price-eur'));
            if (!isNaN(basePrice)) {
                const convertedPrice = (basePrice * currentExchangeRates[currentCurrency]).toFixed(2);
                const currencySymbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'USD' ? '$' : '₴';

                // Ensure "From" is always included
                priceElement.textContent = `From ${currencySymbol}${convertedPrice}`;
            }
        });
    }

    // Call updateLandingPagePrices on page load to apply the selected currency
    updateLandingPagePrices();
});