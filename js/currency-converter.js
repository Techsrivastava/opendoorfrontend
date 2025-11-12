// Currency Converter Module
class CurrencyConverter {
    constructor() {
        this.rates = {
            INR: 1,
            USD: 0.012,
            EUR: 0.011,
            GBP: 0.0095,
            AUD: 0.018,
            CAD: 0.016
        };
        this.currentCurrency = localStorage.getItem('selectedCurrency') || 'INR';
        this.symbols = {
            INR: '₹',
            USD: '$',
            EUR: '€',
            GBP: '£',
            AUD: 'A$',
            CAD: 'C$'
        };
        this.init();
    }

    async init() {
        await this.fetchLiveRates();
        this.createCurrencySelector();
        this.updateAllPrices();
        this.attachEventListeners();
    }

    async fetchLiveRates() {
        try {
            // Using exchangerate-api.com (free tier)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
            const data = await response.json();
            
            if (data && data.rates) {
                this.rates = {
                    INR: 1,
                    USD: data.rates.USD || 0.012,
                    EUR: data.rates.EUR || 0.011,
                    GBP: data.rates.GBP || 0.0095,
                    AUD: data.rates.AUD || 0.018,
                    CAD: data.rates.CAD || 0.016
                };
                console.log('✅ Live exchange rates loaded:', this.rates);
            }
        } catch (error) {
            console.warn('⚠️ Using fallback exchange rates');
        }
    }

    createCurrencySelector() {
        const currencyHTML = `
            <div class="currency-selector" style="position: relative; z-index: 1000;">
                <button class="currency-btn" id="currencyBtn" style="
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                ">
                    <span style="font-size: 16px;">${this.symbols[this.currentCurrency]}</span>
                    <span>${this.currentCurrency}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="transition: transform 0.3s;">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div class="currency-dropdown" id="currencyDropdown" style="
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    display: none;
                    min-width: 180px;
                    overflow: hidden;
                    animation: slideDown 0.3s ease;
                ">
                    ${Object.keys(this.rates).map(currency => `
                        <div class="currency-option" data-currency="${currency}" style="
                            padding: 12px 16px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            transition: background 0.2s;
                            ${this.currentCurrency === currency ? 'background: #f0f9ff; font-weight: 600;' : ''}
                        ">
                            <span style="font-size: 18px; width: 24px;">${this.symbols[currency]}</span>
                            <span style="color: #0f172a; font-size: 14px;">${currency}</span>
                            ${this.currentCurrency === currency ? '<span style="margin-left: auto; color: #F5AD4C;">✓</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <style>
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .currency-option:hover {
                    background: #f8fafc !important;
                }
                .currency-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                    transform: translateY(-2px);
                }
            </style>
        `;

        // Add to navigation or header
        const header = document.querySelector('.header-navbar') || document.querySelector('header');
        if (header) {
            const container = document.createElement('div');
            container.innerHTML = currencyHTML;
            container.style.cssText = 'display: flex; align-items: center; margin-left: 15px;';
            
            // Insert before contact button or at end of nav
            const navRight = header.querySelector('.navbar-nav-right') || header.querySelector('.navbar-nav');
            if (navRight) {
                navRight.appendChild(container);
            }
        }
    }

    attachEventListeners() {
        // Toggle dropdown
        const btn = document.getElementById('currencyBtn');
        const dropdown = document.getElementById('currencyDropdown');
        
        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            // Close on outside click
            document.addEventListener('click', () => {
                dropdown.style.display = 'none';
            });

            // Currency selection
            const options = dropdown.querySelectorAll('.currency-option');
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currency = option.dataset.currency;
                    this.changeCurrency(currency);
                    dropdown.style.display = 'none';
                });
            });
        }
    }

    changeCurrency(newCurrency) {
        this.currentCurrency = newCurrency;
        localStorage.setItem('selectedCurrency', newCurrency);
        
        // Update button
        const btn = document.getElementById('currencyBtn');
        if (btn) {
            btn.innerHTML = `
                <span style="font-size: 16px;">${this.symbols[newCurrency]}</span>
                <span>${newCurrency}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
        }

        // Update dropdown selection
        document.querySelectorAll('.currency-option').forEach(opt => {
            const currency = opt.dataset.currency;
            if (currency === newCurrency) {
                opt.style.cssText = 'padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; background: #f0f9ff; font-weight: 600;';
                if (!opt.querySelector('.checkmark')) {
                    opt.innerHTML += '<span class="checkmark" style="margin-left: auto; color: #F5AD4C;">✓</span>';
                }
            } else {
                opt.style.cssText = 'padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px;';
                const checkmark = opt.querySelector('.checkmark');
                if (checkmark) checkmark.remove();
            }
        });

        this.updateAllPrices();
    }

    convert(amountInINR) {
        if (!amountInINR || isNaN(amountInINR)) return 0;
        return (amountInINR * this.rates[this.currentCurrency]).toFixed(2);
    }

    formatPrice(amountInINR) {
        const converted = this.convert(amountInINR);
        return `${this.symbols[this.currentCurrency]}${parseFloat(converted).toLocaleString()}`;
    }

    updateAllPrices() {
        // Update all price elements
        document.querySelectorAll('[data-price-inr]').forEach(el => {
            const priceINR = parseFloat(el.dataset.priceInr);
            el.textContent = this.formatPrice(priceINR);
        });

        // Dispatch event for dynamic content
        window.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: { currency: this.currentCurrency }
        }));
    }
}

// Initialize currency converter
let currencyConverter;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        currencyConverter = new CurrencyConverter();
        window.currencyConverter = currencyConverter;
    });
} else {
    currencyConverter = new CurrencyConverter();
    window.currencyConverter = currencyConverter;
}
