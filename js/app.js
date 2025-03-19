
// Main application entry point
import { showToast } from './utils.js';
import config from './config.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('MediTrack application initialized');
  console.log('API Base URL:', config.API_BASE_URL);
  console.log('Default User ID:', config.DEFAULT_USER_ID);

  // Initialize the toast notification system
  initializeToast();
});

// Initialize toast notifications
function initializeToast() {
  // No additional initialization needed beyond what's in utils.js
}
