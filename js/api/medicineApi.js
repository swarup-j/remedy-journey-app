
// Medicine API operations
import config from '../config.js';

// Fetch all medicines for the default user
export async function fetchMedicines() {
  try {
    const response = await fetch(`${config.API_BASE_URL}/medicines?userId=${config.DEFAULT_USER_ID}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return [];
  }
}

// Fetch a single medicine by ID
export async function fetchMedicineById(id) {
  try {
    const response = await fetch(`${config.API_BASE_URL}/medicines/${id}?userId=${config.DEFAULT_USER_ID}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return null;
  }
}

// Add a new medicine
export async function addMedicine(medicine) {
  try {
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
  } catch (error) {
    console.error("Error adding medicine:", error);
    return { error: error.message };
  }
}

// Update an existing medicine
export async function updateMedicine(id, medicine) {
  try {
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
  } catch (error) {
    console.error("Error updating medicine:", error);
    return { error: error.message };
  }
}

// Delete a medicine
export async function deleteMedicine(id) {
  try {
    const response = await fetch(`${config.API_BASE_URL}/medicines/${id}?userId=${config.DEFAULT_USER_ID}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return { error: error.message };
  }
}

// Mark medicine as taken
export async function markMedicineAsTaken(medicineId, date, timeSlot) {
  try {
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
  } catch (error) {
    console.error("Error marking medicine as taken:", error);
    return { error: error.message };
  }
}

// Get adherence statistics
export async function getAdherenceStats() {
  try {
    const response = await fetch(`${config.API_BASE_URL}/adherence?userId=${config.DEFAULT_USER_ID}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching adherence stats:", error);
    return { adherenceRate: 0, activeMedicines: 0 };
  }
}
