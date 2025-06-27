// Global variable to store all teas
let allTeas = [];

// Open the search modal and load all teas
async function openSearchModal() {
    document.getElementById('searchModal').style.display = 'block';
    document.getElementById('searchInput').focus(); // Auto-focus the input field

    // Load all teas if we haven't already
    if (allTeas.length === 0) {
        await loadAllTeas();
    }

    // Show all teas initially
    filterTeas('');
}

// Close the search modal
function closeSearchModal() {
    document.getElementById('searchModal').style.display = 'none';
    document.getElementById('searchResults').innerHTML = ''; // Clear results
    document.getElementById('searchInput').value = ''; // Clear input
}

// Load all teas from API
async function loadAllTeas() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '<p>Loading teas...</p>';

    try {
        // Fetch all teas - use an empty query or dedicated endpoint
        const response = await fetch('http://localhost:3000/api/items?all=true');

        if (!response.ok) {
            throw new Error('Failed to fetch teas');
        }

        allTeas = await response.json();
        console.log(`Loaded ${allTeas.length} teas`);

        allTeas = allTeas.map(item => ({
            id: item.id,
            image: item.image_path || 'assets/images/default-tea.jpg',
            name: item.name,
            origin: item.origin,
            description: item.description || '',
            price: `€${parseFloat(item.price_50g).toFixed(2)}`,
            searchText: `${item.name.toLowerCase()} ${item.origin.toLowerCase()} ${(item.description || '').toLowerCase()}`,
            url: `${location.origin}/pages/tea-details.html?id=${item.id}` // ✅ Fixed absolute URL
        }));

    } catch (error) {
        console.error('Error loading teas:', error);
        searchResults.innerHTML = '<p class="error">Failed to load teas. Please try again later.</p>';
    }
}

// Filter teas based on input
function filterTeas() {
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.trim().toLowerCase();
    const searchResults = document.getElementById('searchResults');

    // Clear previous results
    searchResults.innerHTML = '';

    // If we have no teas loaded yet, show loading
    if (allTeas.length === 0) {
        searchResults.innerHTML = '<p>Loading teas...</p>';
        return;
    }

    // Filter teas based on query
    const filteredTeas = searchQuery ?
        allTeas.filter(tea =>
            tea.searchText.includes(searchQuery)
        ) : allTeas;

    // Display results count
    const resultCount = document.createElement('div');
    resultCount.className = 'result-count';

    if (searchQuery) {
        resultCount.textContent = `Found ${filteredTeas.length} result${filteredTeas.length !== 1 ? 's' : ''} for "${searchQuery}"`;
    } else {
        resultCount.textContent = `Showing all ${filteredTeas.length} teas`;
    }

    searchResults.appendChild(resultCount);

    // Display filtered teas
    if (filteredTeas.length === 0) {
        const noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = `No matching teas found for "${searchQuery}"`;
        searchResults.appendChild(noResults);
    } else {
        displaySearchResults(filteredTeas);
    }
}

// Display search results
function displaySearchResults(teas) {
    const searchResultsDiv = document.getElementById('searchResults');

    teas.forEach(tea => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'search-result';

        resultDiv.innerHTML = `
            <div class="tea-image">
                <img src="${tea.image}" alt="${tea.name}">
            </div>
            <div class="tea-info">
                <div class="tea-name">${tea.name}</div>
                <div class="tea-origin">Origin: ${tea.origin}</div>
                ${tea.description ? `<div class="tea-description">${tea.description}</div>` : ''}
                <div class="tea-price">${tea.price}</div>
            </div>
        `;

        resultDiv.addEventListener('click', function () {
            // Handle click on search result
            window.location.href = tea.url;
        });

        searchResultsDiv.appendChild(resultDiv);
    });
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up the Search button to trigger filtering
    const searchButton = document.querySelector('#searchModal button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            filterTeas();
        });
    }

    // Add event listener for Enter key in the search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission behavior
                filterTeas(); // Trigger the search
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('searchModal');
        if (event.target === modal) {
            closeSearchModal();
        }
    });
});