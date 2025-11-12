/**
 * Authentication Handler for Wildex
 * Handles Login, Registration, and User Session
 */

// Global variables
let tempCustomerId = null;
let otpTimer = null;
let otpCountdown = 120; // 2 minutes

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    updateUIBasedOnAuthStatus();
});

/**
 * Initialize authentication handlers
 */
function initializeAuth() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        
        if (event.target == loginModal) {
            closeModal('loginModal');
        }
        if (event.target == registerModal) {
            closeModal('registerModal');
        }
    };

    // Handle Enter key for forms
    document.querySelectorAll('.auth-form-group input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const activeStep = this.closest('.auth-step');
                const button = activeStep.querySelector('.auth-btn:not(.auth-btn-secondary)');
                if (button) button.click();
            }
        });
    });

    console.log('Auth system initialized');
}

/**
 * Open modal by ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        resetModal(modalId);
    }
}

/**
 * Close modal by ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetModal(modalId);
    }
}

/**
 * Reset modal to initial state
 */
function resetModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Hide all steps
    modal.querySelectorAll('.auth-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show first step
    const firstStep = modal.querySelector('.auth-step');
    if (firstStep) firstStep.classList.add('active');

    // Clear all inputs
    modal.querySelectorAll('input').forEach(input => {
        input.value = '';
    });

    // Hide alerts
    modal.querySelectorAll('.auth-alert').forEach(alert => {
        alert.classList.remove('show');
    });

    // Stop timer
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }

    tempCustomerId = null;
}

/**
 * Show specific step in modal
 */
function showStep(modalId, stepNumber) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.querySelectorAll('.auth-step').forEach((step, index) => {
        if (index === stepNumber - 1) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

/**
 * Show alert message
 */
function showAlert(modalId, type, message) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const alert = modal.querySelector('.auth-alert');
    if (!alert) return;

    alert.className = `auth-alert auth-alert-${type} show`;
    alert.textContent = message;

    // Auto hide after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

/**
 * Show loading state on button
 */
function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loading-spinner"></span>Processing...';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
}

/**
 * LOGIN - Step 1: Send OTP
 */
async function sendLoginOTP() {
    const phone = document.getElementById('loginPhone').value.trim();
    const button = event.target;

    // Validation
    if (!phone) {
        showAlert('loginModal', 'error', 'Please enter your phone number');
        return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        showAlert('loginModal', 'error', 'Please enter a valid 10-digit phone number');
        return;
    }

    try {
        setButtonLoading(button, true);

        const result = await AuthAPI.sendLoginOTP(phone);

        if (result.success) {
            tempCustomerId = result.customerId || result._id;
            showStep('loginModal', 2);
            showAlert('loginModal', 'success', 'OTP sent successfully to your phone!');
            startOTPTimer('loginModal');
        } else {
            showAlert('loginModal', 'error', result.message || 'Failed to send OTP. Please try again.');
        }
    } catch (error) {
        console.error('Login OTP Error:', error);
        showAlert('loginModal', 'error', 'Network error. Please check your connection.');
    } finally {
        setButtonLoading(button, false);
    }
}

/**
 * LOGIN - Step 2: Verify OTP
 */
async function verifyLoginOTP() {
    const otp = getOTPValue('loginModal');
    const button = event.target;

    // Validation
    if (!otp || otp.length !== 4) {
        showAlert('loginModal', 'error', 'Please enter the complete 4-digit OTP');
        return;
    }

    if (!tempCustomerId) {
        showAlert('loginModal', 'error', 'Session expired. Please request a new OTP.');
        showStep('loginModal', 1);
        return;
    }

    try {
        setButtonLoading(button, true);

        const result = await AuthAPI.verifyLoginOTP(tempCustomerId, otp);

        if (result.success) {
            showAlert('loginModal', 'success', 'Login successful! Redirecting...');
            
            setTimeout(() => {
                closeModal('loginModal');
                updateUIBasedOnAuthStatus();
                
                // Redirect to dashboard or reload
                if (window.location.pathname.includes('Bookingpage.html')) {
                    location.reload();
                } else {
                    window.location.href = 'trips.html';
                }
            }, 1500);
        } else {
            showAlert('loginModal', 'error', result.message || 'Invalid OTP. Please try again.');
        }
    } catch (error) {
        console.error('Verify Login OTP Error:', error);
        showAlert('loginModal', 'error', 'Verification failed. Please try again.');
    } finally {
        setButtonLoading(button, false);
    }
}

/**
 * REGISTRATION - Step 1: Send OTP
 */
async function sendRegistrationOTP() {
    const phone = document.getElementById('registerPhone').value.trim();
    const button = event.target;

    // Validation
    if (!phone) {
        showAlert('registerModal', 'error', 'Please enter your phone number');
        return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        showAlert('registerModal', 'error', 'Please enter a valid 10-digit phone number');
        return;
    }

    try {
        setButtonLoading(button, true);

        const result = await AuthAPI.sendRegistrationOTP(phone);

        if (result.success) {
            tempCustomerId = result.customerId;
            showStep('registerModal', 2);
            showAlert('registerModal', 'success', 'OTP sent successfully to your phone!');
            startOTPTimer('registerModal');
        } else {
            showAlert('registerModal', 'error', result.message || 'Failed to send OTP. This number may already be registered.');
        }
    } catch (error) {
        console.error('Registration OTP Error:', error);
        showAlert('registerModal', 'error', 'Network error. Please check your connection.');
    } finally {
        setButtonLoading(button, false);
    }
}

/**
 * REGISTRATION - Step 2: Verify OTP
 */
async function verifyRegistrationOTP() {
    const otp = getOTPValue('registerModal');
    const button = event.target;

    // Validation
    if (!otp || otp.length !== 4) {
        showAlert('registerModal', 'error', 'Please enter the complete 4-digit OTP');
        return;
    }

    if (!tempCustomerId) {
        showAlert('registerModal', 'error', 'Session expired. Please request a new OTP.');
        showStep('registerModal', 1);
        return;
    }

    try {
        setButtonLoading(button, true);

        const result = await AuthAPI.verifyRegistrationOTP(tempCustomerId, otp);

        if (result.success) {
            showAlert('registerModal', 'success', 'Registration successful! Welcome aboard!');
            
            setTimeout(() => {
                closeModal('registerModal');
                updateUIBasedOnAuthStatus();
                
                // Redirect to profile completion or home
                window.location.href = 'trips.html';
            }, 1500);
        } else {
            showAlert('registerModal', 'error', result.message || 'Invalid OTP. Please try again.');
        }
    } catch (error) {
        console.error('Verify Registration OTP Error:', error);
        showAlert('registerModal', 'error', 'Verification failed. Please try again.');
    } finally {
        setButtonLoading(button, false);
    }
}

/**
 * Get OTP value from inputs
 */
function getOTPValue(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return '';

    const inputs = modal.querySelectorAll('.otp-input');
    let otp = '';
    inputs.forEach(input => {
        otp += input.value;
    });
    return otp;
}

/**
 * Handle OTP input navigation
 */
function handleOTPInput(event, currentIndex) {
    const input = event.target;
    const maxLength = 1;
    const value = input.value;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
        input.value = '';
        return;
    }

    // Move to next input
    if (value && currentIndex < 3) {
        const nextInput = input.parentElement.children[currentIndex + 1];
        if (nextInput) nextInput.focus();
    }

    // Handle backspace
    if (event.inputType === 'deleteContentBackward' && currentIndex > 0 && !value) {
        const prevInput = input.parentElement.children[currentIndex - 1];
        if (prevInput) prevInput.focus();
    }
}

/**
 * Start OTP countdown timer
 */
function startOTPTimer(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const timerElement = modal.querySelector('.timer-text');
    const resendLink = modal.querySelector('.resend-otp-link');

    if (!timerElement || !resendLink) return;

    otpCountdown = 120; // 2 minutes
    resendLink.classList.add('disabled');

    if (otpTimer) clearInterval(otpTimer);

    otpTimer = setInterval(() => {
        otpCountdown--;
        const minutes = Math.floor(otpCountdown / 60);
        const seconds = otpCountdown % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (otpCountdown <= 0) {
            clearInterval(otpTimer);
            resendLink.classList.remove('disabled');
            timerElement.textContent = '';
        }
    }, 1000);
}

/**
 * Resend OTP
 */
async function resendOTP(modalId) {
    const isLogin = modalId === 'loginModal';
    const phoneInput = document.getElementById(isLogin ? 'loginPhone' : 'registerPhone');
    const phone = phoneInput.value.trim();

    if (!phone) {
        showStep(modalId, 1);
        return;
    }

    try {
        const result = isLogin 
            ? await AuthAPI.sendLoginOTP(phone)
            : await AuthAPI.sendRegistrationOTP(phone);

        if (result.success) {
            tempCustomerId = result.customerId || result._id;
            showAlert(modalId, 'success', 'OTP resent successfully!');
            startOTPTimer(modalId);
        } else {
            showAlert(modalId, 'error', 'Failed to resend OTP. Please try again.');
        }
    } catch (error) {
        console.error('Resend OTP Error:', error);
        showAlert(modalId, 'error', 'Network error. Please try again.');
    }
}

/**
 * Switch between login and registration
 */
function switchToRegister() {
    closeModal('loginModal');
    setTimeout(() => openModal('registerModal'), 300);
}

function switchToLogin() {
    closeModal('registerModal');
    setTimeout(() => openModal('loginModal'), 300);
}

/**
 * Logout user
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        AuthAPI.logout();
    }
}

/**
 * Update UI based on authentication status
 */
function updateUIBasedOnAuthStatus() {
    const isAuthenticated = isLoggedIn();
    const userName = localStorage.getItem('customerName') || 'User';

    // Update header buttons
    const authBtn = document.getElementById('authBtn');
    const userProfile = document.getElementById('userProfileDropdown');

    if (isAuthenticated) {
        if (authBtn) authBtn.style.display = 'none';
        if (userProfile) {
            userProfile.classList.add('show');
            
            // Update user name
            const userNameElement = userProfile.querySelector('.user-name');
            if (userNameElement) userNameElement.textContent = userName || 'User';
            
            // Update avatar initial
            const avatarElement = userProfile.querySelector('.user-avatar');
            if (avatarElement) {
                avatarElement.textContent = (userName || 'U').charAt(0).toUpperCase();
            }
        }
    } else {
        if (authBtn) authBtn.style.display = 'inline-block';
        if (userProfile) userProfile.classList.remove('show');
    }
}

/**
 * Toggle user dropdown
 */
function toggleUserDropdown() {
    const dropdown = document.querySelector('.dropdown-menu-custom');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown-menu-custom');
    const profileBtn = document.querySelector('.user-profile-btn');
    
    if (dropdown && profileBtn && !profileBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

console.log('Auth.js loaded successfully');
