
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

// Dummy data for offline/testing mode
const DUMMY_DATA = {
  // Dummy user
  user: {
    name: "Test User",
    email: "test@example.com",
    password: "password123" // Not secure, only for testing
  },
  
  // Dummy medicines
  medicines: [
    {
      id: "med1",
      name: "Aspirin",
      type: "tablet",
      color: "white",
      dosage: "100mg",
      startDate: "2023-10-01",
      endDate: "2023-12-31",
      frequency: "once",
      timeSlots: ["08:00"],
      days: ["mon", "wed", "fri"],
      notes: "Take with food",
      adherenceRate: 85
    },
    {
      id: "med2",
      name: "Vitamin D",
      type: "capsule",
      color: "yellow",
      dosage: "1000 IU",
      startDate: "2023-09-15",
      endDate: "", // Ongoing
      frequency: "once",
      timeSlots: ["09:00"],
      days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      notes: "Take after breakfast",
      adherenceRate: 92
    },
    {
      id: "med3",
      name: "Antibiotic",
      type: "syrup",
      color: "pink",
      dosage: "5ml",
      startDate: "2023-10-20",
      endDate: "2023-10-30",
      frequency: "twice",
      timeSlots: ["08:00", "20:00"],
      days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      notes: "Finish the full course",
      adherenceRate: 78
    }
  ],
  
  // Dummy adherence stats
  adherence: {
    adherenceRate: 85,
    activeMedicines: 2
  }
};

// Get auth token from local storage
const getAuthToken = () => localStorage.getItem('authToken');

// Check if in demo/testing mode
const isDemoMode = () => localStorage.getItem('demoMode') === 'true';

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

// Set demo mode
const enableDemoMode = () => {
  localStorage.setItem('demoMode', 'true');
  // Generate dummy auth token for demo mode
  localStorage.setItem('authToken', 'dummy-token-for-testing');
  localStorage.setItem('currentUser', JSON.stringify(DUMMY_DATA.user));
  
  console.log('MediTrack: Demo mode enabled with test user account');
  return DUMMY_DATA.user;
};

// Disable demo mode
const disableDemoMode = () => {
  localStorage.removeItem('demoMode');
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  console.log('MediTrack: Demo mode disabled');
};

// Fetch all medicines
const fetchMedicines = async () => {
  // If in demo mode, return dummy data
  if (isDemoMode()) {
    console.log('MediTrack: Returning dummy medicines');
    return DUMMY_DATA.medicines;
  }
  
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
  // If in demo mode, return dummy data
  if (isDemoMode()) {
    const medicine = DUMMY_DATA.medicines.find(med => med.id === id);
    if (medicine) {
      console.log(`MediTrack: Returning dummy medicine with ID ${id}`);
      return medicine;
    }
    return null;
  }
  
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
  // If in demo mode, add to dummy data
  if (isDemoMode()) {
    const newMedicine = {
      ...medicine,
      id: `med${Date.now()}`, // Generate a unique ID
      adherenceRate: 0 // New medicine has no adherence yet
    };
    
    // Add to local storage to persist between page refreshes
    let medicines = JSON.parse(localStorage.getItem('dummyMedicines') || JSON.stringify(DUMMY_DATA.medicines));
    medicines.push(newMedicine);
    localStorage.setItem('dummyMedicines', JSON.stringify(medicines));
    
    console.log('MediTrack: Added dummy medicine', newMedicine);
    return newMedicine;
  }
  
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
  // If in demo mode, update dummy data
  if (isDemoMode()) {
    let medicines = JSON.parse(localStorage.getItem('dummyMedicines') || JSON.stringify(DUMMY_DATA.medicines));
    const index = medicines.findIndex(med => med.id === id);
    
    if (index !== -1) {
      medicines[index] = { ...medicines[index], ...medicine, id };
      localStorage.setItem('dummyMedicines', JSON.stringify(medicines));
      console.log(`MediTrack: Updated dummy medicine with ID ${id}`);
      return medicines[index];
    }
    
    return { error: 'Medicine not found' };
  }
  
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
  // If in demo mode, delete from dummy data
  if (isDemoMode()) {
    let medicines = JSON.parse(localStorage.getItem('dummyMedicines') || JSON.stringify(DUMMY_DATA.medicines));
    const filteredMedicines = medicines.filter(med => med.id !== id);
    
    if (filteredMedicines.length < medicines.length) {
      localStorage.setItem('dummyMedicines', JSON.stringify(filteredMedicines));
      console.log(`MediTrack: Deleted dummy medicine with ID ${id}`);
      return { success: true };
    }
    
    return { error: 'Medicine not found' };
  }
  
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
  // If in demo mode, update dummy data (no actual tracking, just log)
  if (isDemoMode()) {
    console.log(`MediTrack: Marked dummy medicine ${medicineId} as taken on ${date} at ${timeSlot}`);
    return { success: true };
  }
  
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
  // If in demo mode, return dummy data
  if (isDemoMode()) {
    console.log('MediTrack: Returning dummy adherence stats');
    return DUMMY_DATA.adherence;
  }
  
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
  // If in demo mode, return dummy user
  if (isDemoMode()) {
    console.log('MediTrack: Returning dummy user profile');
    return DUMMY_DATA.user;
  }
  
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

// Login function - now with support for demo mode
const login = async (email, password) => {
  // Check if using the demo account
  if (email === DUMMY_DATA.user.email && password === DUMMY_DATA.user.password) {
    const user = enableDemoMode();
    return {
      token: 'dummy-token-for-testing',
      name: user.name,
      email: user.email
    };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Invalid email or password');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Export all API functions
const api = {
  API_BASE_URL,
  ENDPOINTS,
  DUMMY_DATA,
  fetchMedicines,
  fetchMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  markMedicineAsTaken,
  getAdherenceStats,
  getUserProfile,
  createAuthHeaders,
  enableDemoMode,
  disableDemoMode,
  isDemoMode,
  login
};

export default api;
