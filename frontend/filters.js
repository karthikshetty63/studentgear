// Filter functionality
const filters = {
    category: '',
    brand: '',
    priceRange: ''
};

// Initialize filter listeners with readiness guard so script works when
// injected after DOMContentLoaded.
function initFilters() {
    // Get filter elements
    const categoryFilter = document.getElementById('categoryFilter');
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const applyFilterBtn = document.getElementById('applyFilter');
    const resetFilterBtn = document.getElementById('resetFilter');

    if (!applyFilterBtn || !resetFilterBtn) return;

    // Add event listeners
    applyFilterBtn.addEventListener('click', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);

    // Update filters object when selections change
    if (categoryFilter) categoryFilter.addEventListener('change', (e) => filters.category = e.target.value);
    if (brandFilter) brandFilter.addEventListener('change', (e) => filters.brand = e.target.value);
    if (priceFilter) priceFilter.addEventListener('change', (e) => filters.priceRange = e.target.value);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilters);
} else {
    initFilters();
}

// Apply filters to products
function applyFilters() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const category = card.querySelector('.product-category').textContent.toLowerCase();
        const name = card.querySelector('.product-name').textContent.toLowerCase();
        const price = parseFloat(card.querySelector('.product-price').textContent.replace('₹', '').replace(',', ''));

        let visible = true;

        // Category filter
        if (filters.category && category !== filters.category.toLowerCase()) {
            visible = false;
        }

        // Brand filter
        if (filters.brand && !name.includes(filters.brand.toLowerCase())) {
            visible = false;
        }

        // Price range filter
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(p => parseInt(p) || Infinity);
            if (price < min || (max !== Infinity && price > max)) {
                visible = false;
            }
        }

        // Update visibility
        card.style.display = visible ? '' : 'none';
    });

    // Show message if no results
    const visibleProducts = document.querySelectorAll('.product-card:not([style*="display: none"])');
    const noResults = document.querySelector('.no-results') || document.createElement('div');
    noResults.className = 'no-results';

    if (visibleProducts.length === 0) {
        noResults.textContent = 'No products match your filters';
        document.querySelector('.products-grid').appendChild(noResults);
    } else if (document.querySelector('.no-results')) {
        document.querySelector('.no-results').remove();
    }
}

// Reset all filters
function resetFilters() {
    // Reset filter object
    filters.category = '';
    filters.brand = '';
    filters.priceRange = '';

    // Reset select elements
    document.getElementById('categoryFilter').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('priceFilter').value = '';

    // Show all products
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = '';
    });

    // Remove no results message if it exists
    if (document.querySelector('.no-results')) {
        document.querySelector('.no-results').remove();
    }
}