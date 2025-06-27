document.addEventListener('DOMContentLoaded', () => {
    const orderSummaryContainer = document.getElementById('order-summary');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const shippingElement = document.getElementById('shipping');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const updateCheckout = () => {
        orderSummaryContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const total = item.price * item.quantity;
            subtotal += total;

            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            orderItem.innerHTML = `
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.name}" style="width: 68px; height: auto; border-radius: 10px;">
                    <span class="order-item-quantity">${item.quantity}</span>
                </div>
                <div class="order-item-details">
                    <div class="order-item-name">${item.name}</div>
                    <div style="color: #777; font-size: 14px;">${item.weight || ''}</div>
                </div>
                <div class="order-item-price" data-price-eur="${(item.price * item.quantity).toFixed(2)}">€${(item.price * item.quantity).toFixed(2)}</div>
            `;
            orderSummaryContainer.appendChild(orderItem);
        });

        subtotalElement.setAttribute('data-price-eur', subtotal.toFixed(2));
        subtotalElement.textContent = `€${subtotal.toFixed(2)}`;

        const shippingCost = 5.00;
        shippingElement.setAttribute('data-price-eur', shippingCost.toFixed(2));
        shippingElement.textContent = `€${shippingCost.toFixed(2)}`;

        const total = subtotal + shippingCost;
        totalElement.setAttribute('data-price-eur', total.toFixed(2));
        totalElement.textContent = `€${total.toFixed(2)}`;
    };

    window.addEventListener('storage', () => {
        const updatedCart = JSON.parse(localStorage.getItem('cart')) || [];
        updateCheckout(updatedCart);
    });

    updateCheckout();
});
