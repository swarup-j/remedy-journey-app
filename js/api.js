
// API module for MediTrack application
import { fetchMedicines, addMedicine, updateMedicine, deleteMedicine, markMedicineAsTaken, getAdherenceStats } from './api/medicineApi.js';
import { getUserProfile } from './api/userApi.js';

// Consolidated API object
const api = {
  // Medicine operations
  fetchMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  markMedicineAsTaken,
  getAdherenceStats,
  
  // User operations
  getUserProfile
};

export default api;
