
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
    console.error('Error fetching medicines:', error);
    // Return dummy data for offline use
    return getDummyMedicines();
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
    console.error(`Error fetching medicine with ID ${id}:`, error);
    // Return dummy medicine for offline use
    return getDummyMedicines().find(med => med.id === parseInt(id)) || null;
  }
}

// Add a new medicine
export async function addMedicine(medicine) {
  // Add default user ID
  medicine.userId = config.DEFAULT_USER_ID;
  
  try {
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
    console.error('Error adding medicine:', error);
    
    // Offline fallback: store in localStorage
    const dummyMedicines = getDummyMedicines();
    const newMedicine = {
      ...medicine,
      id: Date.now(), // Use timestamp as ID
      createdAt: new Date().toISOString()
    };
    
    dummyMedicines.push(newMedicine);
    localStorage.setItem(`${config.STORAGE_PREFIX}medicines`, JSON.stringify(dummyMedicines));
    
    return newMedicine;
  }
}

// Update an existing medicine
export async function updateMedicine(id, medicine) {
  // Add default user ID
  medicine.userId = config.DEFAULT_USER_ID;
  
  try {
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
    console.error(`Error updating medicine with ID ${id}:`, error);
    
    // Offline fallback: update in localStorage
    const dummyMedicines = getDummyMedicines();
    const index = dummyMedicines.findIndex(med => med.id === parseInt(id));
    
    if (index !== -1) {
      dummyMedicines[index] = { ...medicine, id: parseInt(id) };
      localStorage.setItem(`${config.STORAGE_PREFIX}medicines`, JSON.stringify(dummyMedicines));
      return dummyMedicines[index];
    }
    
    return { error: 'Medicine not found' };
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
    console.error(`Error deleting medicine with ID ${id}:`, error);
    
    // Offline fallback: delete from localStorage
    const dummyMedicines = getDummyMedicines();
    const filteredMedicines = dummyMedicines.filter(med => med.id !== parseInt(id));
    
    if (filteredMedicines.length < dummyMedicines.length) {
      localStorage.setItem(`${config.STORAGE_PREFIX}medicines`, JSON.stringify(filteredMedicines));
      return { success: true };
    }
    
    return { error: 'Medicine not found' };
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
    console.error('Error marking medicine as taken:', error);
    
    // Offline fallback: store in localStorage
    const key = `${config.STORAGE_PREFIX}taken_meds`;
    const takenMeds = JSON.parse(localStorage.getItem(key) || '[]');
    
    const newEntry = {
      id: Date.now(),
      medicineId,
      date,
      timeSlot,
      userId: config.DEFAULT_USER_ID,
      takenAt: new Date().toISOString()
    };
    
    takenMeds.push(newEntry);
    localStorage.setItem(key, JSON.stringify(takenMeds));
    
    return newEntry;
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
    console.error('Error fetching adherence stats:', error);
    
    // Calculate adherence from local data
    const medicines = getDummyMedicines();
    const takenMeds = JSON.parse(localStorage.getItem(`${config.STORAGE_PREFIX}taken_meds`) || '[]');
    
    // Simple calculation for demo purposes
    const activeMedicines = medicines.length;
    const adherenceRate = activeMedicines > 0 ? Math.min(95, Math.floor((takenMeds.length / activeMedicines) * 100)) : 0;
    
    return {
      adherenceRate,
      activeMedicines
    };
  }
}

// Get dummy medicines for offline mode
function getDummyMedicines() {
  const storedMedicines = localStorage.getItem(`${config.STORAGE_PREFIX}medicines`);
  
  if (storedMedicines) {
    return JSON.parse(storedMedicines);
  }
  
  // Initial dummy data
  const dummyMedicines = [
    {
      id: 1,
      name: "Vitamin D",
      type: "tablet",
      color: "yellow",
      startDate: "2023-06-01",
      endDate: "2023-12-31",
      timeSlots: ["08:00", "20:00"],
      days: ["Mon", "Wed", "Fri"],
      notes: "Take with food",
      userId: config.DEFAULT_USER_ID
    },
    {
      id: 2,
      name: "Ibuprofen",
      type: "capsule",
      color: "orange",
      startDate: "2023-06-15",
      endDate: "2023-07-15",
      timeSlots: ["12:00"],
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      notes: "Take as needed for pain",
      userId: config.DEFAULT_USER_ID
    },
    {
      id: 3,
      name: "Fish Oil",
      type: "capsule",
      color: "yellow",
      startDate: "2023-05-01",
      endDate: "2023-12-31",
      timeSlots: ["09:00"],
      days: ["Mon", "Wed", "Fri"],
      notes: "",
      userId: config.DEFAULT_USER_ID
    }
  ];
  
  localStorage.setItem(`${config.STORAGE_PREFIX}medicines`, JSON.stringify(dummyMedicines));
  return dummyMedicines;
}
