// ===== ENHANCED SEARCH FUNCTIONALITY =====

// Debounce function for search suggestions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search suggestion handler
const handleSearchInput = debounce(async (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) {
        hideSearchSuggestions();
        return;
    }

    // Quick search for top matches
    const quickMatches = findProducts(query).slice(0, 3);
    if (quickMatches.length > 0) {
        showSearchSuggestions(quickMatches);
    } else {
        hideSearchSuggestions();
    }
}, 300);

// Elements that will be wired during initialization. Declared here so
// functions above (like showSearchSuggestions) can reference them even
// when the script is injected after DOMContentLoaded.
// Use var to allow redeclaration if script.js already defined these
var searchInput = searchInput || null;
var searchBtn = searchBtn || null;

// Show search suggestions
function showSearchSuggestions(products) {
    let suggestions = document.getElementById('search-suggestions');
    if (!suggestions) {
        suggestions = document.createElement('div');
        suggestions.id = 'search-suggestions';
        suggestions.className = 'search-suggestions';
        searchInput.parentNode.appendChild(suggestions);
    }

    suggestions.innerHTML = products.map(p => `
        <div class="search-suggestion" data-product="${p.name}">
            <span class="suggestion-icon">${p.image || '📦'}</span>
            <div class="suggestion-content">
                <div class="suggestion-name">${p.name}</div>
                <div class="suggestion-price">₹${p.price.toLocaleString('en-IN')}</div>
            </div>
        </div>
    `).join('');

    // Add click handlers
    suggestions.querySelectorAll('.search-suggestion').forEach(el => {
        el.addEventListener('click', () => {
            searchInput.value = el.dataset.product;
            hideSearchSuggestions();
            performSearch(el.dataset.product);
        });
    });
}

// Hide search suggestions
function hideSearchSuggestions() {
    const suggestions = document.getElementById('search-suggestions');
    if (suggestions) {
        suggestions.innerHTML = '';
    }
}

// Toggle search loading state
function setSearchLoading(isLoading) {
    if (isLoading) {
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchBtn.disabled = true;
        searchInput.disabled = true;
        searchBtn.classList.add('loading');
    } else {
        searchBtn.innerHTML = '<i class="fa fa-search"></i>';
        searchBtn.disabled = false;
        searchInput.disabled = false;
        searchBtn.classList.remove('loading');
    }
}

// Main search function
async function performSearch(initialQuery = null) {
    try {
        setSearchLoading(true);

        const raw = initialQuery || searchInput.value.trim();
        if (!raw) {
            showNotification('Please enter a product name or branch to search.');
            return;
        }

        const term = raw.toLowerCase();

        // Clear suggestions
        hideSearchSuggestions();

        // Check for branch names first
        const branchKeys = Object.keys(PRODUCTS_BY_BRANCH);
        if (branchKeys.includes(term.toUpperCase())) {
            showProducts(term.toUpperCase());
            return;
        }

        // Add slight delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        // Find matching products
        const matches = findProducts(term);

        if (matches.length === 0) {
            showNotification(`No products found for "${raw}"`);
            return;
        }

        if (matches.length === 1) {
            // Show buy options modal when only one match exists
            showBuyOptions(matches[0]);
            return;
        }

        // Show results modal for multiple matches
        showSearchResultsModal(matches, raw);

    } catch (error) {
        console.error('Search error:', error);
        showNotification('⚠️ An error occurred while searching. Please try again.');
    } finally {
        setSearchLoading(false);
    }
}

// Show search results modal
function showSearchResultsModal(matches, searchQuery) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'custom-modal search-results-modal';

    modal.innerHTML = `
        <div class="modal-header">
            <h3>Search results for "${searchQuery}"</h3>
            <div class="result-count">${matches.length} items found</div>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-content">
            <div class="search-results-list">
                ${matches.map(p => `
                    <div class="search-result-item">
                        <div class="search-left">
                            ${p.imageUrl ?
            `<img src="${p.imageUrl}" class="result-thumb" alt="${p.name}"/>` :
            `<span class="product-emoji">${p.image || '📦'}</span>`
        }
                        </div>
                        <div class="search-mid">
                            <strong>${p.name}</strong>
                            <div class="result-meta">
                                ${p.category ? `<span class="category-tag">${p.category}</span>` : ''}
                                ${p.badge ? `<span class="badge-tag">${p.badge}</span>` : ''}
                            </div>
                            <div class="muted">${p.description || ''}</div>
                        </div>
                        <div class="search-right">
                            <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
                            <button class="buy-btn">Buy Now</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const closeModal = () => {
        modal.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            overlay.remove();
        }, 300);
    };

    // Event handlers
    overlay.onclick = closeModal;
    modal.querySelector('.close-modal').onclick = closeModal;

    // Buy button handlers
    modal.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.querySelector('.buy-btn').onclick = (ev) => {
            const btn = ev.currentTarget;
            showBuyOptions(matches[index]);
            closeModal();
        };
    });

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Trigger animations
    setTimeout(() => {
        overlay.classList.add('show');
        modal.classList.add('show');
    }, 10);
}

// Initialize search functionality with readiness guard so this works
// whether the script is injected before or after DOMContentLoaded.
function initSearch() {
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    if (!searchInput || !searchBtn) return;

    // Search input handler
    searchInput.addEventListener('input', handleSearchInput);

    // Search button click handler
    searchBtn.addEventListener('click', () => performSearch());

    // Enter key handler
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Click outside to hide suggestions
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-suggestions') && !e.target.closest('#searchInput')) {
            hideSearchSuggestions();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}