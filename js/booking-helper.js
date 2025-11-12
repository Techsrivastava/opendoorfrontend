/**
 * Booking Helper Functions
 * Use these functions on package/trip pages to handle booking
 */

// Track current booking package, coupon, and addons
let currentBookingPackage = null;
let appliedCoupon = null;
let selectedAddons = {}; // {addonId: {name, price, quantity}}
let selectedPaymentType = 'full'; // 'advance' or 'full'

// Debug: Log customer data on page load
console.log('🔍 Booking Helper Loaded - Customer Data:');
console.log('  - Logged In:', isLoggedIn());
console.log('  - Customer ID:', getCurrentCustomerId());
console.log('  - Customer Name:', localStorage.getItem('customerName'));
console.log('  - userInfo:', JSON.parse(localStorage.getItem('userInfo') || '{}'));

/**
 * Handle Book Now button click - Opens booking modal
 * @param {string} packageId - The MongoDB ID of the package
 */
function handleBookNow(packageId) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        // Store booking intent
        localStorage.setItem('bookingIntent', packageId);
        localStorage.setItem('redirectAfterLogin', `booking-modal`);
        
        // Show login modal
        openModal('loginModal');
        return;
    }
    
    // Open booking modal
    openBookingModal(packageId);
}

/**
 * Open booking modal and load package details
 * @param {string} packageId - The MongoDB ID of the package
 */
async function openBookingModal(packageId) {
    try {
        // Fetch package details
        const response = await fetch(`${API_CONFIG.baseURL}/packages/${packageId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned invalid response. Please try again later.');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            currentBookingPackage = data.data;
            appliedCoupon = null; // Reset coupon
            selectedAddons = {}; // Reset addons
            
            // Update modal with package info
            document.getElementById('bookingPackageName').textContent = data.data.name || 'Package Details';
            document.getElementById('modalPackageDuration').textContent = data.data.duration || '-';
            document.getElementById('modalPackageLocation').textContent = `${data.data.city || ''}, ${data.data.state || ''}`.trim() || '-';
            
            const price = data.data.offerPrice || data.data.originalPrice || 0;
            document.getElementById('modalPackagePrice').textContent = `₹${price.toLocaleString('en-IN')}`;
            
            // Load batch dates
            loadBatchDates(data.data.batchDates || []);
            
            // Load additionalServices as addons
            loadModalAddons(data.data.additionalServices || []);
            
            // Reset coupon
            document.getElementById('modalCouponCode').value = '';
            document.getElementById('modalCouponMessage').style.display = 'none';
            document.getElementById('modalDiscountRow').style.display = 'none';
            
            // Reset participants
            document.getElementById('modalParticipants').value = 1;
            
            // Reset payment type to full
            selectedPaymentType = 'full';
            document.getElementById('selectedPaymentType').value = 'full';
            
            // Calculate initial total
            calculateModalTotal();
            
            // Show modal
            document.getElementById('bookingModal').style.display = 'flex';
        } else {
            alert('Unable to load package details. Please try again.');
        }
    } catch (error) {
        console.error('Error loading package:', error);
        alert('Failed to load package details. Please try again.');
    }
}

/**
 * Load batch dates into dropdown
 */
function loadBatchDates(batchDates) {
    const batchSelect = document.getElementById('modalBatchDate');
    batchSelect.innerHTML = '<option value="">Choose a batch...</option>';
    
    if (batchDates && batchDates.length > 0) {
        batchDates.forEach(batch => {
            const date = new Date(batch.startDate || batch.date || batch);
            const formattedDate = date.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            const option = document.createElement('option');
            option.value = batch.startDate || batch.date || batch;
            option.textContent = `${formattedDate}${batch.availableSeats ? ` - ${batch.availableSeats} seats` : ''}`;
            batchSelect.appendChild(option);
        });
    } else {
        // Generate next 6 months dates (every weekend)
        const today = new Date();
        for (let i = 1; i <= 24; i++) { // Next 24 weeks
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + (i * 7)); // Every week
            const formattedDate = futureDate.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            const option = document.createElement('option');
            option.value = futureDate.toISOString().split('T')[0];
            option.textContent = formattedDate;
            batchSelect.appendChild(option);
        }
    }
}

/**
 * Close booking modal
 */
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    currentBookingPackage = null;
    selectedAddons = {};
    
    // Reset form and success message
    const successMsg = document.getElementById('bookingSuccessMessage');
    const bookingForm = document.getElementById('quickBookingForm');
    if (successMsg) successMsg.style.display = 'none';
    if (bookingForm) bookingForm.style.display = 'block';
    
    // Reset payment type selection
    selectedPaymentType = 'full';
}

/**
 * Increase participants count
 */
function increaseParticipants() {
    const input = document.getElementById('modalParticipants');
    let current = parseInt(input.value) || 1;
    if (current < parseInt(input.max)) {
        input.value = current + 1;
        calculateModalTotal();
    }
}

/**
 * Decrease participants count
 */
function decreaseParticipants() {
    const input = document.getElementById('modalParticipants');
    let current = parseInt(input.value) || 1;
    if (current > parseInt(input.min)) {
        input.value = current - 1;
        calculateModalTotal();
    }
}

/**
 * Load addons into modal
 * @param {Array} addons - Array of addon objects from package (additionalServices)
 */
function loadModalAddons(addons) {
    const addonsList = document.getElementById('modalAddonsList');
    const addonsSection = document.getElementById('modalAddonsSection');
    
    // Check if additionalServices exist
    if (!addons || addons.length === 0) {
        addonsSection.style.display = 'none';
        return;
    }
    
    addonsSection.style.display = 'block';
    addonsList.innerHTML = '';
    
    addons.forEach(addon => {
        const addonElement = document.createElement('div');
        addonElement.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.3s;';
        addonElement.onmouseover = function() { this.style.background = '#fff8f0'; this.style.borderColor = '#F5AD4C'; };
        addonElement.onmouseout = function() { 
            if (!selectedAddons[addon._id]) {
                this.style.background = '#f8fafc'; 
                this.style.borderColor = '#e2e8f0';
            }
        };
        
        const addonPrice = parseFloat(addon.price) || 0;
        const addonName = (addon.name || '').replace(/'/g, "\\'");
        
        addonElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <input 
                    type="checkbox" 
                    id="addon-${addon._id}"
                    onchange="toggleAddon('${addon._id}', '${addonName}', ${addonPrice})"
                    style="width: 18px; height: 18px; accent-color: #F5AD4C; cursor: pointer;"
                >
                <div>
                    <div style="font-weight: 600; color: #0f172a; font-size: 15px;">${addon.name}</div>
                    ${addon.description ? `<div style="font-size: 13px; color: #64748b; margin-top: 2px;">${addon.description}</div>` : ''}
                </div>
            </div>
            <div style="font-weight: 700; color: #F5AD4C; font-size: 16px;">
                +₹${addonPrice.toLocaleString('en-IN')}
            </div>
        `;
        
        addonsList.appendChild(addonElement);
    });
}

/**
 * Toggle addon selection
 */
function toggleAddon(addonId, addonName, addonPrice) {
    const checkbox = document.getElementById(`addon-${addonId}`);
    
    if (checkbox.checked) {
        selectedAddons[addonId] = {
            name: addonName,
            price: addonPrice,
            quantity: 1
        };
    } else {
        delete selectedAddons[addonId];
    }
    
    calculateModalTotal();
}

/**
 * Select payment type (advance or full)
 */
function selectPaymentType(type) {
    selectedPaymentType = type;
    document.getElementById('selectedPaymentType').value = type;
    
    const advanceOption = document.getElementById('advancePaymentOption');
    const fullOption = document.getElementById('fullPaymentOption');
    const noteText = document.getElementById('paymentTypeNote');
    const addonsSection = document.getElementById('modalAddonsSection');
    const couponSection = document.querySelector('#modalCouponCode').parentElement.parentElement;
    
    if (type === 'advance') {
        // Style advance as selected
        advanceOption.style.border = '2px solid #F5AD4C';
        advanceOption.style.background = 'linear-gradient(135deg, #FFF8E7 0%, #FFFFFF 100%)';
        fullOption.style.border = '2px solid #e2e8f0';
        fullOption.style.background = '#f8fafc';
        noteText.textContent = 'Pay advance now. Addons will be added to remaining balance.';
        
        // Disable only coupons for advance payment (keep addons enabled)
        if (couponSection) {
            couponSection.style.opacity = '0.5';
            couponSection.style.pointerEvents = 'none';
        }
        
        // Clear applied coupon
        appliedCoupon = null;
        document.getElementById('modalCouponCode').value = '';
        document.getElementById('modalCouponMessage').style.display = 'none';
        
        // Keep addons enabled and visible
        if (addonsSection) {
            addonsSection.style.opacity = '1';
            addonsSection.style.pointerEvents = 'auto';
        }
        
    } else {
        // Style full as selected
        fullOption.style.border = '2px solid #F5AD4C';
        fullOption.style.background = 'linear-gradient(135deg, #FFF8E7 0%, #FFFFFF 100%)';
        advanceOption.style.border = '2px solid #e2e8f0';
        advanceOption.style.background = '#f8fafc';
        noteText.textContent = 'Pay full amount to confirm booking';
        
        // Enable addons and coupons for full payment
        if (addonsSection) {
            addonsSection.style.opacity = '1';
            addonsSection.style.pointerEvents = 'auto';
        }
        if (couponSection) {
            couponSection.style.opacity = '1';
            couponSection.style.pointerEvents = 'auto';
        }
    }
    
    calculateModalTotal();
}

/**
 * Calculate total amount in modal
 */
function calculateModalTotal() {
    if (!currentBookingPackage) return;
    
    const price = currentBookingPackage.offerPrice || currentBookingPackage.originalPrice || 0;
    const participants = parseInt(document.getElementById('modalParticipants').value) || 1;
    
    // Update participant count display
    document.getElementById('modalParticipantCount').textContent = participants;
    
    // Calculate subtotal (package price * participants)
    let subtotal = price * participants;
    
    // Add addon prices
    let addonsTotal = 0;
    Object.values(selectedAddons).forEach(addon => {
        addonsTotal += addon.price * participants; // Addons apply per participant
    });
    
    subtotal += addonsTotal;
    
    let discount = 0;
    let finalTotal = subtotal;
    
    if (appliedCoupon) {
        discount = Math.round((subtotal * appliedCoupon.discount) / 100);
        finalTotal = subtotal - discount;
        
        // Show discount row
        document.getElementById('modalDiscountPercent').textContent = appliedCoupon.discount;
        document.getElementById('modalDiscountAmount').textContent = `- ₹${discount.toLocaleString('en-IN')}`;
        document.getElementById('modalDiscountRow').style.display = 'flex';
    } else {
        document.getElementById('modalDiscountRow').style.display = 'none';
    }
    
    // Parse advance payment from package data
    let advancePaymentAmount = 0;
    if (currentBookingPackage.advancePayment) {
        // Handle string with commas like "12,000" or number
        const advanceStr = String(currentBookingPackage.advancePayment).replace(/,/g, '');
        advancePaymentAmount = parseFloat(advanceStr) || 0;
    }
    
    // Calculate advance for multiple participants
    const totalAdvance = advancePaymentAmount * participants;
    
    // Update payment option displays
    document.getElementById('advanceAmount').textContent = `₹${totalAdvance.toLocaleString('en-IN')}`;
    document.getElementById('fullAmount').textContent = `₹${finalTotal.toLocaleString('en-IN')}`;
    
    // Update total amount based on selected payment type
    const paymentAmount = selectedPaymentType === 'advance' ? totalAdvance : finalTotal;
    
    // Update price display
    document.getElementById('modalSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('modalTotalAmount').textContent = `₹${paymentAmount.toLocaleString('en-IN')}`;
}

/**
 * Apply coupon code
 */
async function applyModalCoupon() {
    const couponCode = document.getElementById('modalCouponCode').value.trim().toUpperCase();
    const messageEl = document.getElementById('modalCouponMessage');
    
    if (!couponCode) {
        messageEl.textContent = 'Please enter a coupon code';
        messageEl.style.color = '#ef4444';
        messageEl.style.display = 'block';
        return;
    }
    
    if (!currentBookingPackage) {
        messageEl.textContent = 'Package not loaded';
        messageEl.style.color = '#ef4444';
        messageEl.style.display = 'block';
        return;
    }
    
    try {
        // Verify coupon with backend
        const response = await fetch(`${API_CONFIG.baseURL}/coupons/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                code: couponCode,
                packageId: currentBookingPackage._id
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            appliedCoupon = data.data;
            messageEl.innerHTML = `<i class="fas fa-check-circle"></i> ${data.data.discount}% discount applied!`;
            messageEl.style.color = '#10b981';
            messageEl.style.display = 'block';
            calculateModalTotal();
        } else {
            appliedCoupon = null;
            messageEl.innerHTML = `<i class="fas fa-times-circle"></i> ${data.message || 'Invalid coupon code'}`;
            messageEl.style.color = '#ef4444';
            messageEl.style.display = 'block';
            calculateModalTotal();
        }
    } catch (error) {
        console.error('Coupon verification error:', error);
        messageEl.innerHTML = `<i class="fas fa-times-circle"></i> Failed to verify coupon`;
        messageEl.style.color = '#ef4444';
        messageEl.style.display = 'block';
    }
}

/**
 * Handle quick booking form submission - Direct payment in modal
 */
async function handleQuickBooking(event) {
    event.preventDefault();
    
    // Validate package data
    if (!currentBookingPackage) {
        console.error('currentBookingPackage is null or undefined');
        alert('Package data not loaded. Please try again.');
        return;
    }
    
    if (!currentBookingPackage._id) {
        console.error('Package ID is missing:', currentBookingPackage);
        alert('Invalid package data. Please refresh and try again.');
        return;
    }
    
    const batchDate = document.getElementById('modalBatchDate').value;
    const participants = parseInt(document.getElementById('modalParticipants').value);
    
    if (!batchDate) {
        alert('Please select a batch date');
        return;
    }
    
    if (!participants || participants < 1) {
        alert('Please enter valid number of participants');
        return;
    }
    
    // Calculate pricing
    const pricePerPerson = parseFloat(currentBookingPackage.offerPrice || currentBookingPackage.originalPrice) || 0;
    const baseTotal = pricePerPerson * participants;
    
    // Parse advance payment from package
    let advancePaymentAmount = 0;
    if (currentBookingPackage.advancePayment) {
        const advanceStr = String(currentBookingPackage.advancePayment).replace(/,/g, '');
        advancePaymentAmount = parseFloat(advanceStr) || 0;
    }
    const totalAdvance = advancePaymentAmount * participants;
    
    // Prepare addons array (always prepare, regardless of payment type)
    const addonsArray = [];
    let addonsTotal = 0;
    
    Object.keys(selectedAddons).forEach(addonId => {
        const addon = selectedAddons[addonId];
        const addonTotal = addon.price * participants;
        addonsTotal += addonTotal;
        
        addonsArray.push({
            name: addon.name,
            price: addon.price,
            quantity: participants,
            total: addonTotal
        });
    });
    
    // Calculate full package total (for backend - always includes addons)
    const fullPackageTotal = baseTotal + addonsTotal;
    
    // Calculate payment total (for Razorpay)
    let paymentTotal = baseTotal;
    if (selectedPaymentType === 'full') {
        paymentTotal += addonsTotal;
        
        // Apply discount only for full payment
        if (appliedCoupon) {
            const discount = Math.round((paymentTotal * appliedCoupon.discount) / 100);
            paymentTotal -= discount;
        }
    }
    
    // Determine payment amount based on selected type
    const paymentAmount = selectedPaymentType === 'advance' ? totalAdvance : paymentTotal;
    
    console.log('═══════════════════════════════════════');
    console.log('💳 Payment Type:', selectedPaymentType);
    console.log('═══════════════════════════════════════');
    console.log('📊 DETAILED CALCULATION:');
    console.log('1. Base Price per person:', pricePerPerson);
    console.log('2. Participants:', participants);
    console.log('3. Base Total:', baseTotal);
    console.log('4. Advance per person:', advancePaymentAmount);
    console.log('5. Total Advance:', totalAdvance);
    console.log('6. Addons selected:', Object.keys(selectedAddons).length);
    console.log('7. Addons Total:', addonsTotal);
    console.log('8. Full Package Total:', fullPackageTotal);
    console.log('9. Payment Total:', paymentTotal);
    console.log('10. Payment Amount (Razorpay):', paymentAmount);
    console.log('═══════════════════════════════════════');
    console.log('Creating booking with package ID:', currentBookingPackage._id);
    if (addonsArray.length > 0) {
        console.log('Selected addons:', addonsArray);
    } else {
        console.log('No addons selected');
    }
    
    // Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // Debug: Check what customer data we have
    console.log('📊 Customer Data Check:', {
        userInfo: userInfo,
        customerId: getCurrentCustomerId(),
        customerName: localStorage.getItem('customerName'),
        customerPhone: localStorage.getItem('customerPhone')
    });
    
    // Disable submit button
    const submitBtn = document.getElementById('modalConfirmPayBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
    
    // Show loader
    showLoader('Creating booking...');
    
    try {
        // Create booking data for backend
        const bookingData = {
            customer: getCurrentCustomerId(),
            package: currentBookingPackage._id,
            travelDate: batchDate,
            participants: participants,
            amount: fullPackageTotal, // Full package total (base + addons)
            advance: selectedPaymentType === 'advance' ? totalAdvance : paymentTotal, // Amount being paid now
            bookedBy: 'Self',
            addons: addonsArray
        };
        
        console.log('═══════════════════════════════════════');
        console.log('📦 BACKEND BOOKING DATA:');
        console.log('═══════════════════════════════════════');
        console.log('customer:', bookingData.customer);
        console.log('package:', bookingData.package);
        console.log('travelDate:', bookingData.travelDate);
        console.log('participants:', bookingData.participants);
        console.log('amount (full package):', bookingData.amount);
        console.log('advance (paying now):', bookingData.advance);
        console.log('bookedBy:', bookingData.bookedBy);
        console.log('addons:', bookingData.addons);
        console.log('═══════════════════════════════════════');
        console.log('⚠️ VALIDATION CHECK:');
        console.log(`advance (${bookingData.advance}) <= amount (${bookingData.amount})`);
        console.log(`Result: ${bookingData.advance <= bookingData.amount ? '✅ PASS - Booking should work!' : '❌ FAIL - This will cause error!'}`);
        console.log('═══════════════════════════════════════');
        
        // Create booking on backend
        const response = await fetch(`${API_CONFIG.baseURL}/bookings/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(bookingData)
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server error. Please try again later.');
        }
        
        const result = await response.json();
        console.log('═══════════════════════════════════════');
        console.log('📥 BACKEND RESPONSE:');
        console.log('═══════════════════════════════════════');
        console.log('Response:', result);
        console.log('═══════════════════════════════════════');
        
        if (!result.success) {
            console.error('❌ BACKEND ERROR:', result.message);
            console.error('Full error details:', result);
            throw new Error(result.message || 'Failed to create booking');
        }
        
        if (!result.data || !result.data._id) {
            throw new Error('Invalid booking response from server');
        }
        
        console.log('✅ Booking created successfully:', result.data);
        
        // Store booking ID for reference
        const createdBookingId = result.data.bookingId || result.data._id;
        
        // Update loader message
        showLoader('Initiating payment gateway...');
        
        // Prepare payment data for Razorpay
        // Get customer name from multiple sources (userInfo first, then localStorage fallback)
        const customerName = userInfo.name || localStorage.getItem('customerName') || 'Guest User';
        const customerEmail = userInfo.email || localStorage.getItem('customerEmail') || '';
        const customerPhone = userInfo.phone || localStorage.getItem('customerPhone') || '';
        
        console.log('👤 Using customer data:', { customerName, customerEmail, customerPhone });
        
        const paymentData = {
            bookingId: createdBookingId,
            packageId: currentBookingPackage._id,
            customerId: getCurrentCustomerId(),
            packageName: currentBookingPackage.name,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            amount: paymentAmount, // Amount in rupees
            paymentType: selectedPaymentType,
            fullAmount: total,
            advanceAmount: totalAdvance
        };
        
        // Initiate Razorpay payment
        await processPayment(paymentData);
        
    } catch (error) {
        console.error('Booking error:', error);
        hideLoader();
        alert('Error: ' + error.message);
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> Confirm & Pay';
    }
}

/**
 * Quick add to cart style booking (optional)
 * @param {string} packageId - The MongoDB ID of the package
 * @param {string} packageName - Name of the package for display
 */
function quickBookPackage(packageId, packageName) {
    if (!isLoggedIn()) {
        if (confirm(`Please login to book "${packageName}". Would you like to login now?`)) {
            localStorage.setItem('bookingIntent', packageId);
            localStorage.setItem('redirectAfterLogin', `book-now.html?package=${packageId}`);
            openModal('loginModal');
        }
        return;
    }
    
    handleBookNow(packageId);
}

/**
 * Check for booking intent after login
 * Call this on page load to handle redirects after login
 */
function checkBookingIntent() {
    const bookingIntent = localStorage.getItem('bookingIntent');
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    
    if (isLoggedIn() && redirectUrl) {
        // Clear the stored data
        localStorage.removeItem('redirectAfterLogin');
        
        // Check if should open modal or redirect to page
        if (redirectUrl === 'booking-modal' && bookingIntent) {
            const packageId = bookingIntent;
            localStorage.removeItem('bookingIntent');
            
            // Small delay to ensure page is loaded
            setTimeout(() => {
                openBookingModal(packageId);
            }, 500);
        } else {
            localStorage.removeItem('bookingIntent');
            // Redirect to booking page
            window.location.href = redirectUrl;
        }
    }
}

// Auto-check booking intent on page load
document.addEventListener('DOMContentLoaded', function() {
    checkBookingIntent();
});

/**
 * Format booking button HTML
 * Use this to create consistent booking buttons across the site
 * @param {string} packageId - The MongoDB ID of the package
 * @param {string} buttonText - Text to display on button (default: "Book Now")
 * @param {string} buttonClass - CSS class for button (default: "btn-default btn-highlighted")
 */
function createBookingButton(packageId, buttonText = 'Book Now', buttonClass = 'btn-default btn-highlighted') {
    return `
        <button class="${buttonClass}" onclick="handleBookNow('${packageId}')">
            <i class="fas fa-ticket-alt"></i> ${buttonText}
        </button>
    `;
}

/**
 * Example usage in HTML:
 * 
 * <!-- Simple booking button -->
 * <button class="btn-default btn-highlighted" onclick="handleBookNow('PACKAGE_ID_HERE')">
 *     <i class="fas fa-ticket-alt"></i> Book Now
 * </button>
 * 
 * <!-- With package name -->
 * <button class="btn-default btn-highlighted" onclick="quickBookPackage('PACKAGE_ID', 'Kedarkantha Trek')">
 *     Book Kedarkantha Trek
 * </button>
 * 
 * <!-- Dynamic button creation -->
 * <div id="bookingButton"></div>
 * <script>
 *     document.getElementById('bookingButton').innerHTML = 
 *         createBookingButton('PACKAGE_ID', 'Reserve Your Spot');
 * </script>
 */

/**
 * Initialize Razorpay Payment
 * @param {Object} bookingData - Booking information
 * @param {Function} successCallback - Called on payment success
 * @param {Function} errorCallback - Called on payment failure
 */
async function initiateRazorpayPayment(bookingData, successCallback, errorCallback) {
    try {
        console.log('💰 Creating Razorpay order');
        console.log('Amount (Rupees):', bookingData.amount);
        
        // Create order on backend using PaymentAPI
        // Convert rupees to paise (Razorpay requires amount in paise)
        const amountInPaise = Math.round(bookingData.amount * 100);
        console.log('Amount (Paise):', amountInPaise);
        
        const data = await PaymentAPI.createOrder({
            amount: amountInPaise, // Amount in paise (required by Razorpay)
            currency: 'INR',
            receipt: `receipt_${bookingData.bookingId}`,
            notes: {
                bookingId: bookingData.bookingId,
                packageId: bookingData.packageId,
                customerId: getCurrentCustomerId(),
                customerName: bookingData.customerName,
                packageName: bookingData.packageName,
                paymentType: bookingData.paymentType
            }
        });
        
        if (!data.success || !data.data) {
            throw new Error(data.message || 'Failed to create payment order');
        }
        
        const order = data.data;
        console.log('✅ Razorpay order created:', order);
        
        // Backend returns 'orderId' field
        const razorpayOrderId = order.orderId || order.id;
        
        // Validate order object
        if (!razorpayOrderId) {
            throw new Error('Invalid order ID received from payment gateway');
        }
        
        console.log('📋 Order ID:', razorpayOrderId);
        
        // Get customer info from localStorage (user is logged in)
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const customerName = bookingData.customerName || userInfo.name || localStorage.getItem('customerName') || 'Customer';
        const customerPhone = bookingData.customerPhone || userInfo.phone || localStorage.getItem('customerPhone') || '';
        const customerEmail = bookingData.customerEmail || userInfo.email || localStorage.getItem('customerEmail') || '';
        
        console.log('👤 Customer Info:', { customerName, customerPhone, customerEmail });
        
        // Razorpay checkout options
        const options = {
            key: 'rzp_live_2hEJnlSEJ8fC9L', // Your Razorpay key
            amount: order.amount, // Amount in paise (from backend)
            currency: order.currency || 'INR',
            name: 'Open Door Expeditions',
            description: bookingData.packageName || 'Adventure Booking',
            image: window.location.origin + '/images/logo.png',
            order_id: razorpayOrderId, // Order ID from Razorpay
            prefill: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone
            },
            notes: {
                bookingId: bookingData.bookingId,
                packageName: bookingData.packageName,
                paymentType: bookingData.paymentType,
                customerName: customerName,
                customerPhone: customerPhone,
                customerId: getCurrentCustomerId()
            },
            theme: {
                color: '#F5AD4C'
            },
            handler: async function (response) {
                console.log('✅ Payment successful, verifying...', response);
                
                // Show verification loader
                if (successCallback) {
                    showLoader('Verifying payment...');
                }
                
                try {
                    // Verify payment on backend using PaymentAPI
                    const verifyData = await PaymentAPI.verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        bookingId: bookingData.bookingId
                    });
                    
                    console.log('Payment verification response:', verifyData);
                    
                    if (verifyData.success) {
                        console.log('✅ Payment verified successfully');
                        if (successCallback) successCallback(verifyData.data);
                    } else {
                        console.error('❌ Payment verification failed:', verifyData.message);
                        if (errorCallback) errorCallback(verifyData.message || 'Payment verification failed');
                    }
                } catch (error) {
                    console.error('❌ Payment verification error:', error);
                    if (errorCallback) errorCallback('Payment verification failed. Please contact support with your payment ID.');
                }
            },
            modal: {
                ondismiss: function() {
                    console.log('⚠️ Payment modal closed by user');
                    hideLoader();
                    if (errorCallback) errorCallback('Payment cancelled. Your booking has been created but not confirmed.');
                }
            }
        };
        
        // Create Razorpay instance and open checkout
        console.log('Opening Razorpay checkout...');
        const rzp = new Razorpay(options);
        
        rzp.on('payment.failed', function (response) {
            console.error('❌ Payment failed:', response.error);
            hideLoader();
            if (errorCallback) {
                const errorMsg = response.error.description || response.error.reason || 'Payment failed';
                errorCallback(errorMsg);
            }
        });
        
        // Open Razorpay modal
        rzp.open();
        
    } catch (error) {
        console.error('Razorpay initiation error:', error);
        if (errorCallback) errorCallback(error.message || 'Failed to initiate payment');
    }
}

/**
 * Load Razorpay script dynamically
 */
function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay script'));
        document.body.appendChild(script);
    });
}

/**
 * Process payment for booking
 * @param {Object} bookingInfo - Contains bookingId, amount, packageName, etc.
 */
async function processPayment(bookingInfo) {
    try {
        // Load Razorpay script
        console.log('Loading Razorpay script...');
        await loadRazorpayScript();
        
        console.log('Initiating payment for booking:', bookingInfo.bookingId);
        
        // Hide loader before Razorpay opens
        hideLoader();
        
        // Initiate payment
        await initiateRazorpayPayment(
            bookingInfo,
            (paymentData) => {
                // Success callback
                console.log('✅ Payment successful:', paymentData);
                
                // Hide loader
                hideLoader();
                
                // Show success message in modal
                const successMsg = document.getElementById('bookingSuccessMessage');
                const bookingForm = document.getElementById('quickBookingForm');
                if (successMsg && bookingForm) {
                    bookingForm.style.display = 'none';
                    successMsg.style.display = 'block';
                }
                
                // Redirect after 3 seconds
                setTimeout(() => {
                    closeBookingModal();
                    window.location.href = 'my-bookings.html';
                }, 3000);
            },
            (error) => {
                // Error callback
                console.error('❌ Payment error:', error);
                
                // Show error alert
                alert(`Payment failed: ${error}`);
                
                // Re-enable submit button
                const submitBtn = document.getElementById('modalConfirmPayBtn');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> Confirm & Pay';
                }
            }
        );
    } catch (error) {
        console.error('❌ Payment processing error:', error);
        
        // Hide loader
        hideLoader();
        
        // Show error alert
        alert('Failed to process payment. Please try again.');
        
        // Re-enable submit button
        const submitBtn = document.getElementById('modalConfirmPayBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> Confirm & Pay';
        }
        
        throw error;
    }
}

console.log('Booking Helper loaded successfully');
