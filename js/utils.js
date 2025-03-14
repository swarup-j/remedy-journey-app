
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

// Get authentication token
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getAuthToken();
}

// Redirect to login if not authenticated
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
