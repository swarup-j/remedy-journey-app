// Medicine API operations
import config from '../config.js';

// Fetch all medicines for the default user
export async function fetchMedicines() {
  try {
    console.log('Fetching medicines from:', `${config.API_BASE_URL}/medicines?userId=${config.DEFAULT_USER_ID}`);
    const response = await fetch(`${config.API_BASE_URL}/medicines?userId=${config.DEFAULT_USER_ID}`);
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Medicines fetched successfully:', data);
    return data;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    // Return dummy data for demonstration
    return [
      {
        id: 1,
        name: "Aspirin",
        type: "Tablet",
        color: "#F2FCE2",
        timeSlots: ["08:00", "20:00"],
        days: ["Mon", "Wed", "Fri"],
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        taken: [{ timeSlot: "08:00", taken: true }]
      },
      {
        id: 2,
        name: "Vitamin D",
        type: "Capsule",
        color: "#FFDEE2",
        timeSlots: ["09:00"],
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        taken: []
      },
      {
        id: 3,
        name: "Ibuprofen",
        type: "Tablet",
        color: "#FEF7CD",
        timeSlots: ["14:00", "22:00"],
        days: ["Tue", "Thu", "Sat"],
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        taken: [{ timeSlot: "14:00", taken: true }]
      }
    ];
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
    console.log('Fetching adherence stats from:', `${config.API_BASE_URL}/adherence?userId=${config.DEFAULT_USER_ID}`);
    const response = await fetch(`${config.API_BASE_URL}/adherence?userId=${config.DEFAULT_USER_ID}`);
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Adherence stats fetched successfully:', data);
    return data;
  } catch (error) {
    console.error("Error fetching adherence stats:", error);
    return { adherenceRate: 85, activeMedicines: 3 };
  }
}
