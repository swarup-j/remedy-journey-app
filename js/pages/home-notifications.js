
// Home page notifications integration
import { initNotifications, addNotification } from '../components/notifications.js';

// Initialize notifications when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add notifications to the home page
  setupHomeNotifications();
});

// Setup home notifications
function setupHomeNotifications() {
  // Check if we're on the home page
  const homeContainer = document.querySelector('.app-container');
  if (!homeContainer) return;
  
  // Add notifications button to header
  const header = document.querySelector('header');
  if (header) {
    const notificationsBtn = document.createElement('button');
    notificationsBtn.id = 'notifications-btn';
    notificationsBtn.className = 'notifications-btn';
    notificationsBtn.innerHTML = `
      <i class="fas fa-bell"></i>
      <span id="notification-badge" class="notification-badge"></span>
    `;
    
    header.appendChild(notificationsBtn);
  }
  
  // Add notifications panel to the page
  const notificationsPanel = document.createElement('div');
  notificationsPanel.id = 'notifications-panel';
  notificationsPanel.className = 'notifications-panel';
  notificationsPanel.innerHTML = `
    <div class="notifications-header">
      <h3>Notifications</h3>
      <button id="close-notifications" class="close-btn">&times;</button>
    </div>
    <div id="notifications-list" class="notifications-list">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    </div>
  `;
  
  document.body.appendChild(notificationsPanel);
  
  // Initialize notifications
  initNotifications();
  
  // Add test notification button (for demo purposes)
  // Will be removed in production
  const addTestButton = document.createElement('button');
  addTestButton.id = 'add-test-notification';
  addTestButton.className = 'test-notification-btn';
  addTestButton.textContent = 'Test Notification';
  addTestButton.addEventListener('click', () => {
    addNotification({
      title: 'New Test Notification',
      message: 'This is a test notification added by clicking the button',
      type: 'reminder'
    });
  });
  
  // Add before the bottom nav
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav && bottomNav.parentNode) {
    bottomNav.parentNode.insertBefore(addTestButton, bottomNav);
  }
}
