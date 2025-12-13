import { PRODUCTS } from './products.js';

// ===== DOM ELEMENTS =====
const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorPanel = document.getElementById('errorPanel');
const errorMessage = document.getElementById('errorMessage');
const closeError = document.getElementById('closeError');
const resultsSection = document.getElementById('resultsSection');
const searchAgainBtn = document.getElementById('searchAgainBtn');

// Result content elements
const productSummary = document.getElementById('productSummary');
const chemicalComponents = document.getElementById('chemicalComponents');
const safeUsage = document.getElementById('safeUsage');
const improperUse = document.getElementById('improperUse');
const environmental = document.getElementById('environmental');

// ===== STATE =====
let selectedIndex = -1;
let filteredProducts = [];

// ===== AUTOCOMPLETE FUNCTIONALITY =====
searchInput.addEventListener('input', (e) => {
  const value = e.target.value.trim();
  
  if (value.length < 1) {
    hideAutocomplete();
    return;
  }

  // Filter products
  filteredProducts = PRODUCTS.filter(product =>
    product.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 10); // Show max 10 suggestions

  if (filteredProducts.length === 0) {
    hideAutocomplete();
    return;
  }

  // Display autocomplete list
  displayAutocomplete(filteredProducts);
  selectedIndex = -1;
});

function displayAutocomplete(products) {
  autocompleteList.innerHTML = '';
  
  products.forEach((product, index) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = product;
    item.dataset.index = index;
    
    // Click event
    item.addEventListener('click', () => {
      searchInput.value = product;
      hideAutocomplete();
    });
    
    autocompleteList.appendChild(item);
  });
  
  autocompleteList.classList.add('active');
}

function hideAutocomplete() {
  autocompleteList.classList.remove('active');
  autocompleteList.innerHTML = '';
  selectedIndex = -1;
}

// ===== KEYBOARD NAVIGATION =====
searchInput.addEventListener('keydown', (e) => {
  const items = autocompleteList.querySelectorAll('.autocomplete-item');
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % items.length;
    updateSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
    updateSelection(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIndex >= 0 && items[selectedIndex]) {
      searchInput.value = filteredProducts[selectedIndex];
      hideAutocomplete();
    } else {
      analyzeProduct();
    }
  } else if (e.key === 'Escape') {
    hideAutocomplete();
  }
});

function updateSelection(items) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

// ===== CLICK OUTSIDE TO CLOSE AUTOCOMPLETE =====
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
    hideAutocomplete();
  }
});

// ===== ERROR HANDLING =====
function showError(message) {
  errorMessage.textContent = message;
  errorPanel.style.display = 'block';
  
  // Auto-hide after 8 seconds
  setTimeout(() => {
    hideError();
  }, 8000);
}

function hideError() {
  errorPanel.style.display = 'none';
}

closeError.addEventListener('click', hideError);

// ===== ANALYZE PRODUCT =====
async function analyzeProduct() {
  const productName = searchInput.value.trim();
  
  // Validation
  if (!productName) {
    showError('Please enter a product name');
    return;
  }
  
  if (productName.length < 2) {
    showError('Product name is too short');
    return;
  }

  // Hide previous results and errors
  resultsSection.style.display = 'none';
  hideError();
  
  // Show loading
  loadingIndicator.style.display = 'block';
  analyzeBtn.disabled = true;
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productName })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze product');
    }
    
    // Display results
    displayResults(data.data);
    
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'Unable to analyze product at the moment. Please try again later.');
  } finally {
    loadingIndicator.style.display = 'none';
    analyzeBtn.disabled = false;
  }
}

// ===== DISPLAY RESULTS =====
function displayResults(data) {
  productSummary.textContent = data.productSummary || 'No information available.';
  chemicalComponents.textContent = data.chemicalComponents || 'No information available.';
  safeUsage.textContent = data.safeUsage || 'No information available.';
  improperUse.textContent = data.improperUse || 'No information available.';
  environmental.textContent = data.environmental || 'No information available.';
  
  resultsSection.style.display = 'block';
  
  // Smooth scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== SEARCH AGAIN =====
function resetSearch() {
  resultsSection.style.display = 'none';
  searchInput.value = '';
  searchInput.focus();
  hideError();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== EVENT LISTENERS =====
analyzeBtn.addEventListener('click', analyzeProduct);
searchAgainBtn.addEventListener('click', resetSearch);

// Allow Enter key in search input
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !autocompleteList.classList.contains('active')) {
    analyzeProduct();
  }
});

// ===== INITIALIZE =====
console.log(`✅ Chemical Safety Hub loaded with ${PRODUCTS.length} products`);
searchInput.focus();

