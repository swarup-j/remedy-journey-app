
// Main application entry point
import { setupOfflineDetection, checkOnlineStatus, showToast } from './utils.js';
import config from './config.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Check if offline banner exists and handle it
  const offlineBanner = document.getElementById('offline-banner');
  if (offlineBanner) {
    initializeOfflineDetection(offlineBanner);
  }
  
  // Initialize the toast notification system
  initializeToast();
  
  // Initialize page-specific functionality
  initializePageSpecificScripts();
});

// Initialize offline detection
function initializeOfflineDetection(offlineBanner) {
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineBanner.classList.remove('show');
      checkServerAvailability();
    } else {
      offlineBanner.classList.add('show');
    }
  }
  
  // Check server availability
  async function checkServerAvailability() {
    const isServerAvailable = await checkOnlineStatus();
    if (!isServerAvailable) {
      offlineBanner.classList.add('show');
      console.log('Server is not available. App is running in offline mode.');
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
}

// Initialize toast notifications
function initializeToast() {
  // No additional initialization needed beyond what's in utils.js
}

// Load page-specific scripts based on current page
function initializePageSpecificScripts() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split('/').pop() || 'index.html';
  
  // Map pages to their specific script files
  console.log(`Current page: ${pageName}`);
  
  // Most scripts are loaded directly in their HTML pages
  // This is just a fallback for dynamic loading if needed
}
