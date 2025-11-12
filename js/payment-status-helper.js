/**
 * Payment Status Helper
 * Functions to display and manage payment status in UI
 */

/**
 * Get payment status badge HTML
 * @param {string} status - Payment status
 * @returns {string} HTML for status badge
 */
function getPaymentStatusBadge(status) {
    const badges = {
        'Paid': '<span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;"><i class="fas fa-check-circle"></i> Paid</span>',
        'Pending': '<span style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;"><i class="fas fa-clock"></i> Pending</span>',
        'Failed': '<span style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;"><i class="fas fa-times-circle"></i> Failed</span>',
        'Refunded': '<span style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;"><i class="fas fa-undo"></i> Refunded</span>'
    };
    
    return badges[status] || badges['Pending'];
}

/**
 * Get booking status badge HTML
 * @param {string} status - Booking status
 * @returns {string} HTML for status badge
 */
function getBookingStatusBadge(status) {
    const badges = {
        'Confirmed': '<span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;"><i class="fas fa-check-circle"></i> Confirmed</span>',
        'Pending': '<span style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;"><i class="fas fa-hourglass-half"></i> Pending</span>',
        'Cancelled': '<span style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;"><i class="fas fa-ban"></i> Cancelled</span>',
        'Completed': '<span style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;"><i class="fas fa-flag-checkered"></i> Completed</span>'
    };
    
    return badges[status] || badges['Pending'];
}

/**
 * Fetch and display payment details for a booking
 * @param {string} bookingId - Booking ID
 * @param {string} containerId - Container element ID to display payment info
 */
async function displayPaymentDetails(bookingId, containerId) {
    try {
        // Show loading state
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="loading-spinner"></div>
                <p style="color: #64748b; margin-top: 10px;">Loading payment details...</p>
            </div>
        `;

        // Fetch payment details
        const response = await PaymentAPI.getPaymentDetails(bookingId);
        
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch payment details');
        }

        const paymentData = response.data;
        
        // Display payment details
        container.innerHTML = `
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                    <i class="fas fa-credit-card"></i> Payment Details
                </h3>
                
                <div style="display: grid; gap: 12px;">
                    <!-- Payment Status -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                        <span style="color: #64748b; font-weight: 600;">Payment Status:</span>
                        ${getPaymentStatusBadge(paymentData.paymentStatus)}
                    </div>
                    
                    <!-- Booking Status -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                        <span style="color: #64748b; font-weight: 600;">Booking Status:</span>
                        ${getBookingStatusBadge(paymentData.status)}
                    </div>
                    
                    ${paymentData.paymentId ? `
                    <!-- Payment ID -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                        <span style="color: #64748b; font-weight: 600;">Payment ID:</span>
                        <span style="color: #0f172a; font-family: monospace; font-size: 12px; background: white; padding: 4px 8px; border-radius: 4px;">${paymentData.paymentId}</span>
                    </div>
                    ` : ''}
                    
                    ${paymentData.paymentDetails && paymentData.paymentDetails.orderId ? `
                    <!-- Order ID -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                        <span style="color: #64748b; font-weight: 600;">Order ID:</span>
                        <span style="color: #0f172a; font-family: monospace; font-size: 12px; background: white; padding: 4px 8px; border-radius: 4px;">${paymentData.paymentDetails.orderId}</span>
                    </div>
                    ` : ''}
                    
                    ${paymentData.paymentDetails && paymentData.paymentDetails.paymentDate ? `
                    <!-- Payment Date -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                        <span style="color: #64748b; font-weight: 600;">Payment Date:</span>
                        <span style="color: #0f172a; font-weight: 600;">${new Date(paymentData.paymentDetails.paymentDate).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                        })}</span>
                    </div>
                    ` : ''}
                    
                    ${paymentData.paymentDetails && paymentData.paymentDetails.paymentMethod ? `
                    <!-- Payment Method -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #64748b; font-weight: 600;">Payment Method:</span>
                        <span style="color: #0f172a; font-weight: 600;">${paymentData.paymentDetails.paymentMethod}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        console.log('✅ Payment details displayed successfully');

    } catch (error) {
        console.error('❌ Error displaying payment details:', error);
        
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="color: #dc2626; font-size: 32px; margin-bottom: 10px;"></i>
                    <p style="color: #dc2626; margin: 0; font-weight: 600;">Failed to load payment details</p>
                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * Check if payment is completed for a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<boolean>}
 */
async function isPaymentCompleted(bookingId) {
    try {
        const response = await PaymentAPI.getPaymentDetails(bookingId);
        
        if (!response.success || !response.data) {
            return false;
        }

        return response.data.paymentStatus === 'Paid';
    } catch (error) {
        console.error('Error checking payment status:', error);
        return false;
    }
}

/**
 * Format payment amount for display
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted amount
 */
function formatPaymentAmount(amount) {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Get payment status icon
 * @param {string} status - Payment status
 * @returns {string} Icon class
 */
function getPaymentStatusIcon(status) {
    const icons = {
        'Paid': 'fa-check-circle',
        'Pending': 'fa-clock',
        'Failed': 'fa-times-circle',
        'Refunded': 'fa-undo'
    };
    
    return icons[status] || 'fa-question-circle';
}

/**
 * Show payment receipt modal
 * @param {Object} paymentDetails - Payment details object
 */
function showPaymentReceipt(paymentDetails) {
    // Create modal HTML
    const modalHTML = `
        <div id="paymentReceiptModal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; justify-content: center; align-items: center;">
            <div style="background: white; border-radius: 16px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #F5AD4C 0%, #e69b3a 100%); color: white; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
                    <i class="fas fa-receipt" style="font-size: 48px; margin-bottom: 12px;"></i>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Payment Receipt</h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Transaction Successful</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 24px;">
                    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <div style="display: grid; gap: 15px;">
                            <div>
                                <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Payment ID</div>
                                <div style="color: #0f172a; font-weight: 600; font-family: monospace; font-size: 14px;">${paymentDetails.paymentId || 'N/A'}</div>
                            </div>
                            
                            <div>
                                <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Order ID</div>
                                <div style="color: #0f172a; font-weight: 600; font-family: monospace; font-size: 14px;">${paymentDetails.orderId || 'N/A'}</div>
                            </div>
                            
                            <div>
                                <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Date</div>
                                <div style="color: #0f172a; font-weight: 600;">${new Date(paymentDetails.paymentDate).toLocaleString('en-IN')}</div>
                            </div>
                            
                            <div>
                                <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Status</div>
                                <div>${getPaymentStatusBadge(paymentDetails.status || 'Paid')}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Close Button -->
                    <button onclick="document.getElementById('paymentReceiptModal').remove()" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #F5AD4C 0%, #e69b3a 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Close on outside click
    document.getElementById('paymentReceiptModal').addEventListener('click', function(e) {
        if (e.target.id === 'paymentReceiptModal') {
            this.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

console.log('✅ Payment Status Helper loaded');
