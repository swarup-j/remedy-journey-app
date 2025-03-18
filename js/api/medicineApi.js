
// Medicine API operations
import config from '../config.js';

// Fetch all medicines for the default user
export async function fetchMedicines() {
  const response = await fetch(`${config.API_BASE_URL}/medicines?userId=${config.DEFAULT_USER_ID}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
}

// Fetch a single medicine by ID
export async function fetchMedicineById(id) {
  const response = await fetch(`${config.API_BASE_URL}/medicines/${id}?userId=${config.DEFAULT_USER_ID}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
}

// Add a new medicine
export async function addMedicine(medicine) {
  // Add default user ID
  medicine.userId = config.DEFAULT_USER_ID;
  
  const response = await fetch(`${config.API_BASE_URL}/medicines`, {
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
}

// Update an existing medicine
export async function updateMedicine(id, medicine) {
  // Add default user ID
  medicine.userId = config.DEFAULT_USER_ID;
  
  const response = await fetch(`${config.API_BASE_URL}/medicines/${id}`, {
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
}

// Delete a medicine
export async function deleteMedicine(id) {
  const response = await fetch(`${config.API_BASE_URL}/medicines/${id}?userId=${config.DEFAULT_USER_ID}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return { success: true };
}

// Mark medicine as taken
export async function markMedicineAsTaken(medicineId, date, timeSlot) {
  const response = await fetch(`${config.API_BASE_URL}/medicines/taken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      medicineId,
      date,
      timeSlot,
      userId: config.DEFAULT_USER_ID
    }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
}

// Get adherence statistics
export async function getAdherenceStats() {
  const response = await fetch(`${config.API_BASE_URL}/adherence?userId=${config.DEFAULT_USER_ID}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
}
