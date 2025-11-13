/**
 * Package Renderer - Displays packages with detailed model data
 * Handles category-wise filtering and comprehensive package information
 */

// Package Display Configuration
const PACKAGE_CONFIG = {
  categories: {
    'Trekking': {
      icon: 'fas fa-mountain',
      color: '#22c55e',
      description: 'Challenging mountain adventures'
    },
    'Trips': {
      icon: 'fas fa-route',
      color: '#3b82f6',
      description: 'Scenic road trips and tours'
    },
    'Expeditions': {
      icon: 'fas fa-flag-checkered',
      color: '#ef4444',
      description: 'Technical climbing expeditions'
    },
    'Spiritual': {
      icon: 'fas fa-om',
      color: '#f59e0b',
      description: 'Sacred pilgrimage journeys'
    }
  },
  
  difficultyLevels: {
    'Easy': { color: '#22c55e', icon: 'fas fa-leaf' },
    'Easy to Moderate': { color: '#84cc16', icon: 'fas fa-seedling' },
    'Moderate': { color: '#f59e0b', icon: 'fas fa-hiking' },
    'Moderate to Difficult': { color: '#f97316', icon: 'fas fa-mountain' },
    'Difficult': { color: '#ef4444', icon: 'fas fa-exclamation-triangle' },
    'Difficult to Very Difficult': { color: '#dc2626', icon: 'fas fa-skull-crossbones' },
    'Very Difficult - Technical': { color: '#991b1b', icon: 'fas fa-fire' }
  }
};

// Package Renderer Class
class PackageRenderer {
  constructor() {
    this.currentCategory = 'all';
    this.packages = [];
    this.filteredPackages = [];
  }

  /**
   * Initialize package display for a specific page
   * @param {string} category - Category to display ('all', 'Trekking', 'Trips', 'Expeditions', 'Spiritual')
   * @param {string} containerId - ID of container element
   */
  async init(category = 'all', containerId = 'trip-list') {
    this.currentCategory = category;
    this.containerId = containerId;
    
    try {
      await this.loadPackages();
      this.renderPackages();
      this.setupFilters();
    } catch (error) {
      console.error('Package Renderer Init Error:', error);
      this.showError('Failed to load packages');
    }
  }

  /**
   * Load packages from API based on category
   */
  async loadPackages() {
    this.showLoading();
    
    try {
      let response;
      
      if (this.currentCategory === 'all') {
        response = await PackageAPI.getAll();
      } else {
        // Normalize category to backend expected values before requesting
        const apiCat = this.normalizeCategoryForApi(this.currentCategory);
        response = await PackageAPI.getByCategory(apiCat);
      }
      
      if (response.success) {
        // If backend returned packages directly use them, otherwise fallback to client-side filtering
        let loaded = response.data || [];

        if ((Array.isArray(loaded) && loaded.length === 0) && this.currentCategory !== 'all') {
          // Backend returned no packages for this category — fetch all and filter client-side
          const allResp = await PackageAPI.getAll();
          if (allResp.success && Array.isArray(allResp.data)) {
            loaded = this.mapAndFilterPackages(this.currentCategory, allResp.data || []);
          } else {
            loaded = [];
          }
        }

        // Ensure we always have an array
        this.packages = Array.isArray(loaded) ? loaded : [];
        this.filteredPackages = [...this.packages];
        console.log(`Loaded ${this.packages.length} packages for category: ${this.currentCategory}`);
      } else {
        throw new Error(response.message || 'Failed to load packages');
      }
    } catch (error) {
      console.error('Load Packages Error:', error);
      this.packages = [];
      this.filteredPackages = [];
      throw error;
    }
  }

  /**
   * Normalize a UI/page category to API category query value
   * @param {string} category
   * @returns {string}
   */
  normalizeCategoryForApi(category) {
    if (!category) return '';
    const c = category.toString().toLowerCase();

    // Return values matching backend expected category names (capitalized)
    if (c.includes('trek')) return 'Trekking';
    if (c.includes('spiritual') || c.includes('pilgrim') || c.includes('dham') || c.includes('yatra')) return 'Spiritual';
    if (c.includes('expedit') || c.includes('adventur')) return 'Expeditions';
    if (c.includes('trip') || c.includes('tour')) return 'Trips';

    // Fallback: return category as-is (useful when already correct)
    return category;
  }

  /**
   * Map and filter raw packages array for a given category using name and category fallbacks
   * @param {string} category - Page category (Trekking, Trips, Expeditions, Spiritual)
   * @param {Array} data - Array of package objects
   * @returns {Array} Filtered packages
   */
  mapAndFilterPackages(category, data) {
    if (!Array.isArray(data)) return [];
    // Helper to get a normalized category tag for a package: 'trek', 'trip', 'expedition', 'spiritual' or 'other'
    const detectPackageCategory = (pkg) => {
      const name = (pkg.name || pkg.title || '').toString().toLowerCase();

      let catVal = '';
      if (pkg.categoryName) catVal = pkg.categoryName.toString().toLowerCase();
      else if (pkg.category && typeof pkg.category === 'string') catVal = pkg.category.toString().toLowerCase();
      else if (pkg.category && pkg.category.name) catVal = pkg.category.name.toString().toLowerCase();

      // Check explicit category fields first
      if (catVal.includes('trek')) return 'trek';
      if (catVal.includes('trip') || catVal.includes('tour')) return 'trip';
      if (catVal.includes('expedit') || catVal.includes('adventur')) return 'expedition';
      if (catVal.includes('spiritual') || catVal.includes('pilgrim') || catVal.includes('dham') || catVal.includes('yatra')) return 'spiritual';

      // Fallback to name heuristics
      if (name.includes('trek') || name.includes('summit') || name.includes('roopkund') || name.includes('valley of flowers') || name.includes('climb')) return 'trek';
      if (name.includes('trip') || name.includes('tour') || name.includes('package') || name.includes('city tour')) return 'trip';
      if (name.includes('expedition') || name.includes('rafting') || name.includes('camping')) return 'expedition';
      if (name.includes('kedarnath') || name.includes('badrinath') || name.includes('yatra') || name.includes('dham')) return 'spiritual';

      return 'other';
    };

    const want = (category || '').toString().toLowerCase();

    switch (want) {
      case 'trekking':
      case 'trek':
      case 'treks':
        return data.filter(pkg => detectPackageCategory(pkg) === 'trek');

      case 'spiritual':
      case 'pilgrimage':
        return data.filter(pkg => detectPackageCategory(pkg) === 'spiritual');

      case 'expeditions':
      case 'expedition':
      case 'adventure':
        return data.filter(pkg => detectPackageCategory(pkg) === 'expedition');

      case 'trips':
      case 'trip':
      default:
        // Trips: explicitly include items detected as 'trip' or 'other' (other = general packages that are not treks/expeditions/spiritual)
        return data.filter(pkg => {
          const detected = detectPackageCategory(pkg);
          return detected === 'trip' || detected === 'other';
        });
    }
  }

  /**
   * Render packages in the container
   */
  renderPackages() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      return;
    }

    if (this.filteredPackages.length === 0) {
      container.innerHTML = this.getEmptyState();
      return;
    }

    const packagesHTML = this.filteredPackages.map(pkg => this.renderPackageCard(pkg)).join('');
    container.innerHTML = packagesHTML;
    
    // Initialize any interactive elements
    this.initializeCardInteractions();
  }

  /**
   * Render individual package card with detailed model data
   * @param {Object} pkg - Package object
   * @returns {string} HTML string for package card
   */
  renderPackageCard(pkg) {
    const categoryConfig = PACKAGE_CONFIG.categories[pkg.categoryName] || PACKAGE_CONFIG.categories['Trips'];
    const difficultyConfig = PACKAGE_CONFIG.difficultyLevels[pkg.trekInfo?.find(info => info.title === 'Difficulty Level')?.value] || 
                           PACKAGE_CONFIG.difficultyLevels['Moderate'];

    const maxAltitude = pkg.trekInfo?.find(info => info.title === 'Maximum Altitude')?.value || 'N/A';
    const totalDistance = pkg.trekInfo?.find(info => info.title === 'Total Distance')?.value || 'N/A';
    const bestTime = pkg.trekInfo?.find(info => info.title === 'Best Time' || info.title === 'Best Time to Visit')?.value || 'All Season';

    return `
      <div class="col-lg-4 col-md-6 col-12">
        <div class="trip-item wow fadeInUp" data-wow-delay="0.1s">
          <!-- Package Image -->
          <div class="trip-item-image">
            <figure class="image-anime">
              <img src="${pkg.images?.cardImage || 'images/default-package.jpg'}" alt="${pkg.name}">
            </figure>
            
            <!-- Package Labels -->
            <div class="trip-labels">
              ${pkg.isNew ? '<span class="label-new">New</span>' : ''}
              ${pkg.isFeatured ? '<span class="label-featured">Featured</span>' : ''}
              ${pkg.isTrending ? '<span class="label-trending">Trending</span>' : ''}
            </div>
            
            <!-- Category Badge -->
            <div class="category-badge" style="background-color: ${categoryConfig.color}">
              <i class="${categoryConfig.icon}"></i>
              <span>${pkg.categoryName}</span>
            </div>
            
            <!-- Difficulty Badge -->
            <div class="difficulty-badge" style="background-color: ${difficultyConfig.color}">
              <i class="${difficultyConfig.icon}"></i>
              <span>${pkg.trekInfo?.find(info => info.title === 'Difficulty Level')?.value || 'Moderate'}</span>
            </div>
          </div>

          <!-- Package Content -->
          <div class="trip-item-content">
            <!-- Package Header -->
            <div class="trip-header">
              <div class="trip-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${pkg.city}, ${pkg.state}</span>
              </div>
              <div class="trip-rating">
                <div class="rating-stars">
                  ${this.renderStars(pkg.rating || 4.5)}
                </div>
                <span class="rating-value">${pkg.rating || 4.5}</span>
              </div>
            </div>

            <!-- Package Title -->
            <h3 class="trip-title">
              <a href="trip-single.html?id=${pkg._id}">${pkg.name}</a>
            </h3>

            <!-- Package Description -->
            <p class="trip-description">${pkg.description}</p>

            <!-- Package Details Grid -->
            <div class="trip-details-grid">
              <div class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <div class="detail-content">
                  <span class="detail-label">Duration</span>
                  <span class="detail-value">${pkg.duration}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <i class="fas fa-users"></i>
                <div class="detail-content">
                  <span class="detail-label">Max Group</span>
                  <span class="detail-value">${pkg.maxParticipants} people</span>
                </div>
              </div>
              
              <div class="detail-item">
                <i class="fas fa-mountain"></i>
                <div class="detail-content">
                  <span class="detail-label">Max Altitude</span>
                  <span class="detail-value">${maxAltitude}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <i class="fas fa-route"></i>
                <div class="detail-content">
                  <span class="detail-label">Distance</span>
                  <span class="detail-value">${totalDistance}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <i class="fas fa-sun"></i>
                <div class="detail-content">
                  <span class="detail-label">Best Time</span>
                  <span class="detail-value">${bestTime}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <i class="fas fa-tag"></i>
                <div class="detail-content">
                  <span class="detail-label">Trip Type</span>
                  <span class="detail-value">${pkg.tripType}</span>
                </div>
              </div>
            </div>

            <!-- Package Features -->
            <div class="trip-features">
              <div class="feature-tags">
                ${pkg.tags?.slice(0, 3).map(tag => `<span class="feature-tag">${tag}</span>`).join('') || ''}
              </div>
            </div>

            <!-- Package Pricing -->
            <div class="trip-pricing">
              <div class="price-section">
                ${pkg.originalPrice !== pkg.offerPrice ? 
                  `<span class="original-price">₹${parseInt(pkg.originalPrice).toLocaleString('en-IN')}</span>` : ''
                }
                <span class="offer-price">₹${parseInt(pkg.offerPrice).toLocaleString('en-IN')}</span>
                <span class="price-label">per person</span>
              </div>
              
              ${pkg.originalPrice !== pkg.offerPrice ? 
                `<div class="discount-badge">
                  Save ₹${(parseInt(pkg.originalPrice) - parseInt(pkg.offerPrice)).toLocaleString('en-IN')}
                </div>` : ''
              }
            </div>

            <!-- Package Actions -->
            <div class="trip-actions">
              <button class="btn-secondary btn-outline" onclick="viewPackageDetails('${pkg._id}')">
                <i class="fas fa-eye"></i> View Details
              </button>
              <button class="btn-primary" onclick="bookPackage('${pkg._id}')">
                <i class="fas fa-calendar-check"></i> Book Now
              </button>
            </div>

            <!-- Next Batch Date -->
            ${pkg.batchDates && pkg.batchDates.length > 0 ? `
              <div class="next-batch">
                <i class="fas fa-calendar"></i>
                <span>Next Batch: ${this.formatDate(pkg.batchDates[0].startDate)}</span>
                <span class="seats-available">${pkg.batchDates[0].seatsAvailable} seats left</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render star rating
   * @param {number} rating - Rating value
   * @returns {string} HTML for stars
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
  }

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Setup filter functionality
   */
  setupFilters() {
    // Add filter controls if they exist
    const filterContainer = document.getElementById('package-filters');
    if (filterContainer) {
      this.renderFilters(filterContainer);
    }
  }

  /**
   * Render filter controls
   * @param {Element} container - Filter container element
   */
  renderFilters(container) {
    const filtersHTML = `
      <div class="filter-controls">
        <div class="filter-group">
          <label>Sort by:</label>
          <select id="sortFilter" onchange="packageRenderer.applySorting(this.value)">
            <option value="featured">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration">Duration</option>
            <option value="difficulty">Difficulty</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Difficulty:</label>
          <select id="difficultyFilter" onchange="packageRenderer.applyFilters()">
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Difficult">Difficult</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Price Range:</label>
          <select id="priceFilter" onchange="packageRenderer.applyFilters()">
            <option value="">All Prices</option>
            <option value="0-10000">Under ₹10,000</option>
            <option value="10000-25000">₹10,000 - ₹25,000</option>
            <option value="25000-50000">₹25,000 - ₹50,000</option>
            <option value="50000+">Above ₹50,000</option>
          </select>
        </div>
      </div>
    `;
    
    container.innerHTML = filtersHTML;
  }

  /**
   * Apply sorting to packages
   * @param {string} sortBy - Sort criteria
   */
  applySorting(sortBy) {
    switch (sortBy) {
      case 'price-low':
        this.filteredPackages.sort((a, b) => parseInt(a.offerPrice) - parseInt(b.offerPrice));
        break;
      case 'price-high':
        this.filteredPackages.sort((a, b) => parseInt(b.offerPrice) - parseInt(a.offerPrice));
        break;
      case 'duration':
        this.filteredPackages.sort((a, b) => {
          const aDays = parseInt(a.duration.split(' ')[0]);
          const bDays = parseInt(b.duration.split(' ')[0]);
          return aDays - bDays;
        });
        break;
      case 'rating':
        this.filteredPackages.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        break;
      case 'featured':
      default:
        this.filteredPackages.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isTrending && !b.isTrending) return -1;
          if (!a.isTrending && b.isTrending) return 1;
          return 0;
        });
        break;
    }
    
    this.renderPackages();
  }

  /**
   * Apply filters to packages
   */
  applyFilters() {
    const difficultyFilter = document.getElementById('difficultyFilter')?.value;
    const priceFilter = document.getElementById('priceFilter')?.value;
    
    this.filteredPackages = this.packages.filter(pkg => {
      // Difficulty filter
      if (difficultyFilter) {
        const difficulty = pkg.trekInfo?.find(info => info.title === 'Difficulty Level')?.value || '';
        if (!difficulty.toLowerCase().includes(difficultyFilter.toLowerCase())) {
          return false;
        }
      }
      
      // Price filter
      if (priceFilter) {
        const price = parseInt(pkg.offerPrice);
        const [min, max] = priceFilter.split('-').map(p => parseInt(p.replace('+', '')));
        
        if (priceFilter.includes('+')) {
          if (price < min) return false;
        } else {
          if (price < min || price > max) return false;
        }
      }
      
      return true;
    });
    
    this.renderPackages();
  }

  /**
   * Show loading state
   */
  showLoading() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading packages...</p>
          </div>
        </div>
      `;
    }
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  showError(message) {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
            <button class="btn-primary" onclick="location.reload()">Try Again</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Get empty state HTML
   * @returns {string} Empty state HTML
   */
  getEmptyState() {
    return `
      <div class="col-12">
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No packages found</h3>
          <p>We couldn't find any packages matching your criteria. Try adjusting your filters or check back later.</p>
          <button class="btn-primary" onclick="packageRenderer.clearFilters()">Clear Filters</button>
        </div>
      </div>
    `;
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    const difficultyFilter = document.getElementById('difficultyFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (difficultyFilter) difficultyFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortFilter) sortFilter.value = 'featured';
    
    this.filteredPackages = [...this.packages];
    this.applySorting('featured');
  }

  /**
   * Initialize card interactions
   */
  initializeCardInteractions() {
    // Add any interactive functionality here
    // Like hover effects, quick view, etc.
  }
}

// Global package renderer instance
let packageRenderer = new PackageRenderer();

// Global functions for package actions
function viewPackageDetails(packageId) {
  window.location.href = `trip-single.html?id=${packageId}`;
}

function bookPackage(packageId) {
  // Check if user is logged in
  if (!isLoggedIn()) {
    openModal('loginModal');
    return;
  }
  
  window.location.href = `Bookingpage.html?packageId=${packageId}`;
}

// Initialize package renderer based on page
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop();
  let category = 'all';
  
  // Determine category based on current page
  switch (currentPage) {
    case 'treks.html':
      category = 'Trekking';
      break;
    case 'trips.html':
      category = 'Trips';
      break;
    case 'expeditions.html':
      category = 'Expeditions';
      break;
    case 'spiritual.html':
      category = 'Spiritual';
      break;
    default:
      category = 'all';
  }
  
  // Initialize package renderer if trip-list container exists
  if (document.getElementById('trip-list')) {
    packageRenderer.init(category, 'trip-list');
  }
});
