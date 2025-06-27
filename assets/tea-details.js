document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const teaId = urlParams.get('id');

    if (!teaId) {
        window.location.href = 'white-tea.html';
        return;
    }

    loadTeaDetails(teaId);
});

function loadTeaDetails(teaId) {
    const detailsContainer = document.getElementById('tea-details-container');
    detailsContainer.innerHTML = '<div class="loader">Loading...</div>';

    const apiUrl = `http://localhost:3000/api/items/${teaId}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(tea => {
            document.title = `${tea.name} - Chalore Tea`;

            let categoryPage = '';
            switch (tea.category) {
                case 'white': categoryPage = 'white-tea.html'; break;
                case 'green': categoryPage = 'green-tea.html'; break;
                case 'oolong': categoryPage = 'oolong.html'; break;
                case 'black': categoryPage = 'black-tea.html'; break;
                case 'puerh': categoryPage = 'puerh.html'; break;
                case 'matcha': categoryPage = 'matcha.html'; break;
                default: categoryPage = 'white-tea.html';
            }

            const formattedPrice = parseFloat(tea.price_50g).toFixed(2);

            const detailsHTML = `
                <div class="breadcrumb">
                    <a href="../index.html">Home</a> / 
                    <a href="${categoryPage}">${tea.category.charAt(0).toUpperCase() + tea.category.slice(1)} Tea</a> / 
                    <span>${tea.name}</span>
                </div>

                <div class="tea-details-layout" style="display: flex; gap: 20px; align-items: flex-start;">
                    <div class="tea-image" style="flex: 0 0 50%; max-width: 500px;">
                        <img src="${tea.image_path}" alt="${tea.name}" style="width: 100%; height: auto; border-radius: 30px;">
                    </div>
                    
                    <div class="tea-info" style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 40px;">
                        <h1>${tea.name}</h1>
                        <p class="tea-origin">${tea.origin}</p>
                        <div class="tea-description">${tea.description || 'No description available.'}</div>

                        <p class="tea-price" id="tea-price" data-price-eur="${formattedPrice}">€${formattedPrice}</p>

                        <div class="weight-selector" style="margin-top: 20px;">
                            <label for="weight">Select weight:</label>
                            <select id="weight" style="padding: 5px 10px; font-size: 1rem; border-radius: 30px; border: 1px solid #ccc;">
                                <option value="50g">50g</option>
                                <option value="100g">100g</option>
                            </select>
                        </div>

                        <div class="quantity" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px;">
                            <button class="quantity-decrease" style="background-color: #f1f1f1; border: 1px solid #ccc; border-radius: 30px; padding: 5px 10px;">-</button>
                            <input type="number" value="1" min="1" id="tea-quantity" style="border: 1px solid #ccc; padding: 5px; border-radius: 30px; width: auto; text-align: center;">
                            <button class="quantity-increase" style="background-color: #f1f1f1; border: 1px solid #ccc; border-radius: 30px; padding: 5px 10px;">+</button>
                        </div>

                        <button class="add-to-cart" data-id="${tea.id}" style="margin-top: 20px; padding: 10px 20px; width: auto; background-color: black; color: white; border: none; border-radius: 30px; cursor: pointer;">
                            <span class="material-icons">add_shopping_cart</span> Add to Cart
                        </button>

                        <div class="tea-details-section" style="margin-top: 30px;">
                            <h3>Brewing Instructions</h3>
                            <p>${tea.brewing_instructions || 'No brewing instructions available.'}</p>
                        </div>

                        <div class="tea-details-section" style="margin-top: 30px;">
                            <h3>Flavor Profile</h3>
                            <p>${tea.flavor_profile || 'No flavor profile available.'}</p>
                        </div>
                    </div>
                </div>
            `;

            detailsContainer.innerHTML = detailsHTML;

            // 💰 Price logic
            const basePrice = parseFloat(tea.price_50g);
            const weightSelect = document.getElementById('weight');
            const quantityInput = document.getElementById('tea-quantity');
            const priceElement = document.getElementById('tea-price');
            const increaseBtn = document.querySelector('.quantity-increase');
            const decreaseBtn = document.querySelector('.quantity-decrease');

            // Get the currently selected currency
            const currencySelector = document.getElementById('currency-selector');
            const currentCurrency = currencySelector ? currencySelector.value : 'EUR';

            // Get the exchange rates and symbols
            const exchangeRatesCache = localStorage.getItem('exchangeRatesCache');
            let exchangeRate = 1;
            let currencySymbol = '€';

            if (exchangeRatesCache) {
                try {
                    const exchangeRatesData = JSON.parse(exchangeRatesCache);
                    exchangeRate = exchangeRatesData.rates[currentCurrency] || 1;

                    // Set currency symbol
                    switch (currentCurrency) {
                        case 'USD': currencySymbol = '$'; break;
                        case 'UAH': currencySymbol = '₴'; break;
                        default: currencySymbol = '€';
                    }
                } catch (e) {
                    console.error('Error parsing exchange rates:', e);
                }
            }

            function updatePrice() {
                const weight = weightSelect.value;
                const quantity = parseInt(quantityInput.value) || 1;

                const multiplier = (weight === '100g') ? 1.8 : 1.0;
                const totalEUR = basePrice * multiplier * quantity;

                // Convert to selected currency
                const totalConverted = totalEUR * exchangeRate;

                // Update display price
                priceElement.textContent = `${currencySymbol}${totalConverted.toFixed(2)}`;

                // Always keep the base EUR price as a data attribute for currency conversion
                priceElement.setAttribute('data-price-eur', totalEUR.toFixed(2));
            }

            weightSelect.addEventListener('change', updatePrice);
            quantityInput.addEventListener('input', updatePrice);
            increaseBtn.addEventListener('click', () => {
                quantityInput.value = parseInt(quantityInput.value) + 1;
                updatePrice();
            });
            decreaseBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value);
                if (current > 1) {
                    quantityInput.value = current - 1;
                    updatePrice();
                }
            });

            updatePrice();

            // Apply currency conversion from currency.js if available
            if (typeof updatePrices === 'function' && currencySelector) {
                setTimeout(() => {
                    updatePrices(currencySelector.value);
                }, 100);
            }

            // 🛒 Adding to cart
            const addToCartBtn = document.querySelector('.add-to-cart');
            addToCartBtn.addEventListener('click', function () {
                const quantity = parseInt(quantityInput.value);
                const weight = weightSelect.value;
                const multiplier = (weight === '100g') ? 1.8 : 1.0;
                const totalPrice = basePrice * multiplier;

                addToCart(
                    tea.id + '_' + weight,
                    `${tea.name} (${weight})`,
                    totalPrice,
                    quantity,
                    tea.image_path
                );

                alert(`Added ${quantity} ${tea.name} (${weight}) to cart!`);
            });
        })
        .catch(error => {
            console.error('Error fetching tea details:', error);
            detailsContainer.innerHTML = `
                <div class="breadcrumb">
                    <a href="../index.html">Home</a> / 
                    <a href="white-tea.html">White Tea</a>
                </div>
                <div class="error-message">
                    <h2>Failed to load tea details</h2>
                    <p>Please try again later or contact support.</p>
                    <p>Error: ${error.message}</p>
                    <a href="white-tea.html">Back to White Tea</a>
                </div>
            `;
        });
}

function addToCart(id, name, price, quantity, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === id);

    // Get current currency info
    const currencySelector = document.getElementById('currency-selector');
    const currentCurrency = currencySelector ? currencySelector.value : 'EUR';

    // If not EUR, we need to store the original EUR price for consistency
    let eurPrice = price;

    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id,
            name,
            price: eurPrice, // Always store original EUR price
            currency: 'EUR', // Mark as EUR price
            quantity,
            image
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    if (typeof updateCartIcon === 'function') {
        updateCartIcon();
    }
}