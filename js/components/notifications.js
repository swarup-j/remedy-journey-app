
// Notifications component for MediTrack
import { showToast } from '../utils.js';

// DOM Elements
let notificationsBtn;
let notificationsPanel;
let notificationsList;
let notificationBadge;
let closeNotificationsBtn;

// Notifications data
let notifications = [];
let unreadCount = 0;

// Initialize notifications
export function initNotifications() {
  // Find DOM elements
  notificationsBtn = document.getElementById('notifications-btn');
  notificationsPanel = document.getElementById('notifications-panel');
  notificationsList = document.getElementById('notifications-list');
  notificationBadge = document.getElementById('notification-badge');
  closeNotificationsBtn = document.getElementById('close-notifications');
  
  if (!notificationsBtn || !notificationsPanel) return;
  
  // Add event listeners
  notificationsBtn.addEventListener('click', toggleNotificationsPanel);
  
  if (closeNotificationsBtn) {
    closeNotificationsBtn.addEventListener('click', () => {
      notificationsPanel.classList.remove('show');
    });
  }
  
  // Close when clicking outside
  document.addEventListener('click', (event) => {
    if (notificationsPanel && notificationsPanel.classList.contains('show') && 
        !notificationsPanel.contains(event.target) && 
        !notificationsBtn.contains(event.target)) {
      notificationsPanel.classList.remove('show');
    }
  });
  
  // Load notifications (simulate API call)
  loadNotifications();
}

// Toggle notifications panel
function toggleNotificationsPanel() {
  if (!notificationsPanel) return;
  
  notificationsPanel.classList.toggle('show');
  
  // Mark as read when opened
  if (notificationsPanel.classList.contains('show')) {
    markAllAsRead();
  }
}

// Load notifications (simulated)
async function loadNotifications() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Demo notifications
  notifications = [
    {
      id: 1,
      title: "Medication Reminder",
      message: "Don't forget to take Lisinopril at 8:00 PM",
      time: "10 minutes ago",
      read: false,
      type: "reminder"
    },
    {
      id: 2,
      title: "Appointment Scheduled",
      message: "Dr. Johnson appointment confirmed for tomorrow at 2:00 PM",
      time: "2 hours ago",
      read: false,
      type: "appointment"
    },
    {
      id: 3,
      title: "Refill Alert",
      message: "Your Metformin prescription is due for refill",
      time: "Yesterday",
      read: true,
      type: "refill"
    }
  ];
  
  // Update unread count
  updateUnreadCount();
  
  // Render notifications
  renderNotifications();
}

// Render notifications in panel
function renderNotifications() {
  if (!notificationsList) return;
  
  if (notifications.length === 0) {
    notificationsList.innerHTML = `
      <div class="empty-notifications">
        <i class="fas fa-bell-slash"></i>
        <p>No notifications</p>
      </div>
    `;
    return;
  }
  
  notificationsList.innerHTML = notifications.map(notification => `
    <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
      <div class="notification-icon ${notification.type}">
        <i class="fas ${getIconForType(notification.type)}"></i>
      </div>
      <div class="notification-content">
        <h4>${notification.title}</h4>
        <p>${notification.message}</p>
        <span class="notification-time">${notification.time}</span>
      </div>
      <button class="notification-action" data-id="${notification.id}">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
  
  // Add event listeners to dismiss buttons
  const dismissButtons = notificationsList.querySelectorAll('.notification-action');
  dismissButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissNotification(parseInt(button.dataset.id));
    });
  });
  
  // Add event listeners to notification items
  const notificationItems = notificationsList.querySelectorAll('.notification-item');
  notificationItems.forEach(item => {
    item.addEventListener('click', () => {
      markAsRead(parseInt(item.dataset.id));
      // Handle notification click (could navigate to relevant page)
      showToast('Notification viewed');
    });
  });
}

// Get appropriate icon for notification type
function getIconForType(type) {
  switch (type) {
    case 'reminder':
      return 'fa-clock';
    case 'appointment':
      return 'fa-calendar-check';
    case 'refill':
      return 'fa-prescription-bottle';
    default:
      return 'fa-bell';
  }
}

// Mark notification as read
function markAsRead(id) {
  const notification = notifications.find(n => n.id === id);
  if (notification && !notification.read) {
    notification.read = true;
    updateUnreadCount();
    renderNotifications();
  }
}

// Mark all notifications as read
function markAllAsRead() {
  let hasUnread = false;
  
  notifications.forEach(notification => {
    if (!notification.read) {
      notification.read = true;
      hasUnread = true;
    }
  });
  
  if (hasUnread) {
    updateUnreadCount();
    renderNotifications();
  }
}

// Dismiss notification
function dismissNotification(id) {
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    if (!notifications[index].read) {
      // Update unread count if dismissing unread notification
      notifications[index].read = true;
      updateUnreadCount();
    }
    
    // Remove from array
    notifications.splice(index, 1);
    
    // Re-render
    renderNotifications();
    
    showToast('Notification dismissed');
  }
}

// Update unread count
function updateUnreadCount() {
  unreadCount = notifications.filter(n => !n.read).length;
  
  if (notificationBadge) {
    if (unreadCount > 0) {
      notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      notificationBadge.classList.add('show');
    } else {
      notificationBadge.classList.remove('show');
    }
  }
}

// Add a new notification (for testing)
export function addNotification(notification) {
  notifications.unshift({
    id: Date.now(),
    read: false,
    time: 'Just now',
    ...notification
  });
  
  updateUnreadCount();
  renderNotifications();
  
  // Show toast
  showToast('New notification received');
}
