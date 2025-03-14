
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
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEDICINES}`);
    if (!response.ok) {
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
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEDICINE.replace(':id', id)}`);
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ADHERENCE}`);
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
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PROFILE}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { 
      name: 'User',
      email: 'user@example.com'
    };
  }
};

// Export all API functions
const api = {
  fetchMedicines,
  fetchMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  markMedicineAsTaken,
  getAdherenceStats,
  getUserProfile,
  ENDPOINTS
};

export default api;
