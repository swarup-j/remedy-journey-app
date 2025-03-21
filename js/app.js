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
  
  // Add custom CSS for the toggle icon
  addCustomStyles();
});

// Initialize toast notifications
function initializeToast() {
  // No additional initialization needed beyond what's in utils.js
}

// Add custom styles for new UI elements
function addCustomStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .time-slot {
      transition: all 0.3s ease;
    }
    .time-slot.taken {
      background-color: rgba(0, 128, 0, 0.05);
    }
    .take-btn.taken {
      background-color: transparent;
      color: #4CAF50;
      border: 1px solid #4CAF50;
    }
    .toggle-icon {
      font-size: 0.8em;
      margin-left: 5px;
      opacity: 0.7;
    }
    .take-btn.taken:hover .toggle-icon {
      transform: rotate(-45deg);
      opacity: 1;
    }
  `;
  document.head.appendChild(styleElement);
}

// Import our notification styles manually since we don't have a bundler
const notificationStyles = document.createElement('link');
notificationStyles.rel = 'stylesheet';
notificationStyles.href = 'js/styles/notifications.css';
document.head.appendChild(notificationStyles);
