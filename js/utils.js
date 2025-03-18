
// Utility functions for MediTrack

// Show a toast notification
export function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

// Check online status
export async function checkOnlineStatus() {
  try {
    const online = navigator.onLine;
    if (!online) return false;
    
    // Additional check by pinging the server
    const response = await fetch(`${window.location.origin}/ping`, { 
      method: 'HEAD',
      cache: 'no-store',
      timeout: 2000
    });
    return response.ok;
  } catch (error) {
    console.log('Connection check failed:', error);
    return false;
  }
}

// Setup offline detection
export function setupOfflineDetection() {
  const offlineBanner = document.getElementById('offline-banner');
  
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineBanner.classList.remove('show');
    } else {
      offlineBanner.classList.add('show');
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
}

// Format date for display
export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get current date in YYYY-MM-DD format
export function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Show alert modal
export function showAlert(title, message) {
  const modal = document.getElementById('alert-modal');
  
  if (!modal) {
    alert(`${title}: ${message}`);
    return;
  }
  
  const alertTitle = document.getElementById('alert-title');
  const alertMessage = document.getElementById('alert-message');
  const closeBtn = document.querySelector('.close-btn');
  const okBtn = document.getElementById('alert-ok');
  
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  
  modal.style.display = 'flex';
  
  // Close modal events
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };
  
  okBtn.onclick = function() {
    modal.style.display = 'none';
  };
  
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// Authentication check function (always returns true as we're using default user)
export function requireAuth() {
  // Since we're using default userId=1, no authentication is needed
  // This function always returns true
  return true;
}
