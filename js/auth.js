
// Auth functionality for login and signup

document.addEventListener('DOMContentLoaded', () => {
  // Initialize forms based on current page
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (loginForm) {
    initializeLoginForm();
  } else if (signupForm) {
    initializeSignupForm();
  }
  
  // Initialize password toggle functionality
  initializePasswordToggle();
});

// Initialize login form
function initializeLoginForm() {
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');
  const loginText = document.getElementById('login-text');
  const loginSpinner = document.getElementById('login-spinner');
  const errorDisplay = document.getElementById('auth-error');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    
    // Show loading state
    setLoading(true);
    errorDisplay.textContent = '';
    
    try {
      // Simulate API request
      await simulateLoginRequest(email, password);
      
      // Show success message
      showToast('Login successful!');
      
      // Simulate redirect after successful login
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } catch (error) {
      showError(error.message);
      setLoading(false);
    }
  });
  
  function setLoading(isLoading) {
    if (isLoading) {
      loginText.classList.add('hidden');
      loginSpinner.classList.remove('hidden');
      loginButton.disabled = true;
    } else {
      loginText.classList.remove('hidden');
      loginSpinner.classList.add('hidden');
      loginButton.disabled = false;
    }
  }
  
  function showError(message) {
    errorDisplay.textContent = message;
  }
}

// Initialize signup form
function initializeSignupForm() {
  const signupForm = document.getElementById('signup-form');
  const signupButton = document.getElementById('signup-button');
  const signupText = document.getElementById('signup-text');
  const signupSpinner = document.getElementById('signup-spinner');
  const errorDisplay = document.getElementById('auth-error');
  
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const userData = {
      fname: document.getElementById('fname').value.trim(),
      lname: document.getElementById('lname').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      blood_group: document.getElementById('blood_group').value,
      height: parseFloat(document.getElementById('height').value) || 0,
      weight: parseFloat(document.getElementById('weight').value) || 0,
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirm_password').value
    };
    
    // Basic validation
    if (!userData.fname || !userData.lname || !userData.email || !userData.password) {
      showError('Please fill in all required fields');
      return;
    }
    
    if (!isValidEmail(userData.email)) {
      showError('Please enter a valid email address');
      return;
    }
    
    if (userData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    // Show loading state
    setLoading(true);
    errorDisplay.textContent = '';
    
    try {
      // Simulate API request
      await simulateSignupRequest(userData);
      
      // Show success message
      showToast('Account created successfully!');
      
      // Simulate redirect after successful signup
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      
    } catch (error) {
      showError(error.message);
      setLoading(false);
    }
  });
  
  function setLoading(isLoading) {
    if (isLoading) {
      signupText.classList.add('hidden');
      signupSpinner.classList.remove('hidden');
      signupButton.disabled = true;
    } else {
      signupText.classList.remove('hidden');
      signupSpinner.classList.add('hidden');
      signupButton.disabled = false;
    }
  }
  
  function showError(message) {
    errorDisplay.textContent = message;
  }
}

// Initialize password toggle functionality
function initializePasswordToggle() {
  const togglePassword = document.getElementById('toggle-password');
  
  if (togglePassword) {
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', () => {
      // Toggle password visibility
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icon
      togglePassword.textContent = type === 'password' ? 'visibility_off' : 'visibility';
    });
  }
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Mock API functions
async function simulateLoginRequest(email, password) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple validation for demo (in real app, this would be server-side)
  if (email && password) {
    return {
      success: true,
      user: {
        uid: 1,
        fname: "John",
        lname: "Doe",
        email: email
      }
    };
  }
  
  throw new Error('Invalid email or password');
}

async function simulateSignupRequest(userData) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple validation for demo (in real app, this would be server-side)
  if (userData.email.includes('taken')) {
    throw new Error('This email is already registered');
  }
  
  return {
    success: true,
    user: {
      uid: Math.floor(Math.random() * 1000) + 1,
      fname: userData.fname,
      lname: userData.lname,
      email: userData.email
    }
  };
}

// Show toast notification
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.style.display = 'flex';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  }
}
