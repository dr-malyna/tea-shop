document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const headerHeight = header.offsetHeight;

    // Always keep header fixed
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.width = '100%';
    header.style.zIndex = '1000';
});