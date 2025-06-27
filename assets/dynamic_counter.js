document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Define updateCart so any page can call it
    window.updateCart = function (newItem, quantity) {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(item => item.id === newItem.id);

        if (index !== -1) {
            cart[index].quantity += quantity;
        } else {
            cart.push({ ...newItem, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    };

    // Update cart count icon
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const counterEl = document.getElementById('cart-count');
        if (counterEl) {
            counterEl.textContent = count;
        }
    }

    updateCartCount();
});
