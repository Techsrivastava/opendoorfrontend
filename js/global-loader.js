/**
 * Global Loader System
 * Shows/hides loader for data loading and processes
 */

// Show loader
function showLoader(message = 'Loading...') {
    const loader = document.getElementById('globalLoader');
    const loaderText = document.getElementById('loaderText');
    
    if (loader) {
        if (loaderText && message) {
            loaderText.textContent = message;
        }
        loader.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

// Hide loader
function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Auto-hide loader after delay (for page load)
function autoHideLoader(delay = 1000) {
    setTimeout(() => {
        hideLoader();
    }, delay);
}

// Show loader on page load
window.addEventListener('load', function() {
    // Hide loader after all content is loaded
    autoHideLoader(500);
});

// Show loader on page unload (navigation)
window.addEventListener('beforeunload', function() {
    showLoader('Loading...');
});

// Intercept fetch requests to show loader
const originalFetch = window.fetch;
let activeRequests = 0;

window.fetch = function(...args) {
    activeRequests++;
    if (activeRequests === 1) {
        showLoader('Loading data...');
    }
    
    return originalFetch.apply(this, args)
        .then(response => {
            activeRequests--;
            if (activeRequests === 0) {
                setTimeout(() => hideLoader(), 300);
            }
            return response;
        })
        .catch(error => {
            activeRequests--;
            if (activeRequests === 0) {
                setTimeout(() => hideLoader(), 300);
            }
            throw error;
        });
};

// Manual loader control for specific processes
window.loaderControl = {
    show: showLoader,
    hide: hideLoader,
    showWithMessage: (msg) => showLoader(msg),
    showForProcess: async (message, processFunction) => {
        showLoader(message);
        try {
            const result = await processFunction();
            hideLoader();
            return result;
        } catch (error) {
            hideLoader();
            throw error;
        }
    }
};

console.log('Global Loader System initialized');
