document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalElement = document.getElementById('cart-subtotal');

    if (cartItemsContainer && cartSubtotalElement) {
        renderCart();
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const total = item.price * item.quantity;
            subtotal += total;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: auto; border-radius: 12px;">
                            <span>${item.name}</span>
                        </div>
                        <span class="remove-item" data-index="${index}" style="color: red; cursor: pointer; font-size: 0.85em; margin-left: 70px;">× Remove</span>
                    </div>
                </td>
                <td style="text-align: center;" class="cart-item-price" data-price-eur="${item.price.toFixed(2)}">€${item.price.toFixed(2)}</td>
                <td style="text-align: center;">
                    <div class="quantity-container" style="display: flex; align-items: center; justify-content: center; gap: 10px; min-width: 120px; height: 30px;">
                        <button class="quantity-decrease" data-index="${index}" style="background-color: transparent; border: 1px solid #ccc; border-radius: 50%; cursor: pointer; font-size: 16px; padding: 5px 8px; width: 30px; height: 30px;">-</button>
                        <span class="quantity-display" style="font-size: 18px; font-weight: bold;">${item.quantity}</span>
                        <button class="quantity-increase" data-index="${index}" style="background-color: transparent; border: 1px solid #ccc; border-radius: 50%; cursor: pointer; font-size: 16px; padding: 5px 8px; width: 30px; height: 30px;">+</button>
                    </div>
                </td>
                <td style="text-align: center;" class="cart-item-total" data-price-eur="${total.toFixed(2)}">€${total.toFixed(2)}</td>
            `;
            cartItemsContainer.appendChild(row);
        });

        cartSubtotalElement.setAttribute('data-price-eur', subtotal.toFixed(2));
        cartSubtotalElement.classList.add('cart-total-price');
        cartSubtotalElement.textContent = `€${subtotal.toFixed(2)}`;

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeItem(index);
            });
        });

        document.querySelectorAll('.quantity-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                updateQuantity(index, 1);
            });
        });

        document.querySelectorAll('.quantity-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                updateQuantity(index, -1);
            });
        });

        updateCartDisplayPrices(
            localStorage.getItem('preferredCurrency') || 'EUR',
            currentExchangeRates[localStorage.getItem('preferredCurrency')] || 1,
            currencySymbols[localStorage.getItem('preferredCurrency')] || '€'
        );

        updateCartCount();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    function updateQuantity(index, change) {
        const item = cart[index];
        const newQuantity = Math.max(1, item.quantity + change);
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    window.updateCart = function (newItem, quantity) {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(item => item.id === newItem.id);

        if (index !== -1) {
            cart[index].quantity += quantity;
        } else {
            cart.push({ ...newItem, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        if (cartItemsContainer && cartSubtotalElement) {
            renderCart();
        }

        updateCartCount();
    };

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const counterEl = document.getElementById('cart-count');
        if (counterEl) {
            counterEl.textContent = count;
        }
    }

    updateCartCount();
});
