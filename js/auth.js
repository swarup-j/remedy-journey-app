
// Authentication module for MediTrack
import api from '../api.js';
import { showToast, checkOnlineStatus, setupOfflineDetection } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  setupOfflineDetection();
  
  // Check if user is already logged in
  const token = localStorage.getItem('authToken');
  if (token && !window.location.pathname.includes('index.html')) {
    // Only redirect if not already on index page
    window.location.href = 'index.html';
  }
  
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    
    // Add demo mode button to login page
    const formActions = loginForm.querySelector('.form-actions');
    if (formActions) {
      const demoButton = document.createElement('button');
      demoButton.type = 'button';
      demoButton.className = 'secondary-button full-width';
      demoButton.textContent = 'Try Demo Mode';
      demoButton.addEventListener('click', () => {
        document.getElementById('email').value = api.DUMMY_DATA.user.email;
        document.getElementById('password').value = api.DUMMY_DATA.user.password;
        
        // Show toast informing about demo credentials
        showToast('Demo credentials loaded. Click Login to continue.');
      });
      
      formActions.appendChild(demoButton);
    }
  }
  
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
    
    // Password confirmation validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (passwordInput && confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        if (passwordInput.value !== confirmPasswordInput.value) {
          confirmPasswordInput.setCustomValidity("Passwords don't match");
        } else {
          confirmPasswordInput.setCustomValidity('');
        }
      });
    }
    
    // Add demo mode option to register page as well
    const formActions = registerForm.querySelector('.form-actions');
    if (formActions) {
      const demoLink = document.createElement('a');
      demoLink.href = 'login.html';
      demoLink.className = 'demo-link';
      demoLink.textContent = 'Or try our demo mode instead';
      formActions.appendChild(demoLink);
    }
  }
  
  // Logout functionality (for use in profile.html)
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  // Add demo mode indicator if in demo mode
  if (api.isDemoMode()) {
    addDemoModeIndicator();
  }
});

function addDemoModeIndicator() {
  // Check if indicator already exists
  if (document.getElementById('demo-mode-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'demo-mode-indicator';
  indicator.className = 'demo-mode-indicator';
  indicator.innerHTML = '<i class="fas fa-flask"></i> Demo Mode';
  
  document.body.appendChild(indicator);
}

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  
  try {
    const online = await checkOnlineStatus();
    
    // Allow demo mode login even when offline
    const isDemoLogin = email === api.DUMMY_DATA.user.email && password === api.DUMMY_DATA.user.password;
    
    if (!online && !isDemoLogin) {
      errorDiv.textContent = 'Cannot login while offline. Please check your internet connection.';
      return;
    }
    
    errorDiv.textContent = '';
    
    // Use the enhanced login function from the API
    const data = await api.login(email, password);
    
    // Store auth token and user info
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify({
      name: data.name,
      email: data.email
    }));
    
    showToast(isDemoLogin ? 'Demo login successful! You can explore all features.' : 'Login successful! Redirecting...');
    
    // Redirect to home page after short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = error.message || 'Login failed. Please try again.';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const errorDiv = document.getElementById('register-error');
  
  // Client-side validation
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match.';
    return;
  }
  
  if (password.length < 8) {
    errorDiv.textContent = 'Password must be at least 8 characters long.';
    return;
  }
  
  try {
    const online = await checkOnlineStatus();
    if (!online) {
      errorDiv.textContent = 'Cannot register while offline. Please check your internet connection.';
      return;
    }
    
    errorDiv.textContent = '';
    const response = await fetch(`${api.API_BASE_URL}${api.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    showToast('Account created successfully! Redirecting to login...');
    
    // Redirect to login page after short delay
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    
  } catch (error) {
    console.error('Registration error:', error);
    errorDiv.textContent = error.message || 'Registration failed. Please try again.';
  }
}

function handleLogout() {
  // Clear authentication data
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  
  showToast('Logged out successfully');
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// Export auth functions for use in other modules
export { handleLogout };
