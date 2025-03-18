
// Main application entry point
import { showToast } from './utils.js';
import config from './config.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the toast notification system
  initializeToast();
  
  // Initialize page-specific functionality
  initializePageSpecificScripts();
});

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
