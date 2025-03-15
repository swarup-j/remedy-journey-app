// MediTrack API Service
// This file contains all API endpoints and functions for communication with the backend

const API_BASE_URL = 'http://localhost:8080/api'; // Change this to match your Java backend URL

// API Endpoints
const ENDPOINTS = {
  MEDICINES: '/medicines',
  MEDICINE: '/medicines/:id',
  ADHERENCE: '/adherence',
  PROFILE: '/users/profile',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  TAKEN: '/medicines/taken',
};

// Get auth token from local storage
const getAuthToken = () => localStorage.getItem('authToken');

// Create auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Error handler
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // Server responded with error
    return { error: error.response.data.message || 'Server error occurred' };
  } else if (error.request) {
    // Request made but no response
    return { error: 'No response from server. Please check your connection.' };
  } else {
    // Something else went wrong
    return { error: error.message || 'An unexpected error occurred' };
  }
};

// Fetch all medicines
const fetchMedicines = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEDICINES}`, {
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      // Handle unauthorized access
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return [];
  }
};

// Fetch single medicine details
const fetchMedicineById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEDICINE.replace(':id', id)}`, {
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching medicine with ID ${id}:`, error);
    return null;
  }
};

// Add new medicine
const addMedicine = async (medicine) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEDICINES}`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(medicine),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding medicine:', error);
    return { error: error.message || 'Failed to add medicine' };
  }
};

// Update existing medicine
const updateMedicine = async (id, medicine) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEDICINE.replace(':id', id)}`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify(medicine),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating medicine with ID ${id}:`, error);
    return { error: error.message || 'Failed to update medicine' };
  }
};

// Delete medicine
const deleteMedicine = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEDICINE.replace(':id', id)}`, {
      method: 'DELETE',
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting medicine with ID ${id}:`, error);
    return { error: error.message || 'Failed to delete medicine' };
  }
};

// Mark medicine as taken
const markMedicineAsTaken = async (medicineId, date, timeSlot) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TAKEN}`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        medicineId,
        date,
        timeSlot
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error marking medicine as taken:', error);
    return { error: error.message || 'Failed to mark medicine as taken' };
  }
};

// Get adherence data for profile statistics
const getAdherenceStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ADHERENCE}`, {
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching adherence stats:', error);
    return { adherenceRate: 0, activeMedicines: 0 };
  }
};

// Get user profile information
const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PROFILE}`, {
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Fallback to local storage if available
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    return { 
      name: 'User',
      email: 'user@example.com'
    };
  }
};

// Export all API functions
const api = {
  API_BASE_URL,
  ENDPOINTS,
  fetchMedicines,
  fetchMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  markMedicineAsTaken,
  getAdherenceStats,
  getUserProfile,
  createAuthHeaders
};

export default api;
