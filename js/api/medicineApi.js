
// Medicine API operations
import config from '../config.js';

// Dummy data for medicines
const dummyMedicines = [
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
  },
  {
    id: 4,
    name: "Lisinopril",
    type: "Tablet",
    color: "#E2F5FC",
    timeSlots: ["08:00"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    taken: []
  }
];

// Fetch all medicines for the default user
export async function fetchMedicines() {
  console.log('Using dummy medicines data instead of API');
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return dummyMedicines;
}

// Fetch a single medicine by ID
export async function fetchMedicineById(id) {
  console.log(`Using dummy medicine data for ID: ${id}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const medicine = dummyMedicines.find(med => med.id === parseInt(id));
  return medicine || null;
}

// Add a new medicine
export async function addMedicine(medicine) {
  console.log('Adding medicine to dummy data:', medicine);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Generate new ID
  const newId = Math.max(...dummyMedicines.map(m => m.id)) + 1;
  
  // Add to dummy data
  const newMedicine = {
    ...medicine,
    id: newId,
    userId: config.DEFAULT_USER_ID
  };
  
  // In a real implementation, we would push to dummyMedicines here
  // For demonstration, we'll just return the new medicine
  return newMedicine;
}

// Update an existing medicine
export async function updateMedicine(id, medicine) {
  console.log(`Updating medicine with ID: ${id}`, medicine);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // In a real implementation, we would update the medicine in dummyMedicines
  // For demonstration, we'll just return the updated medicine
  return {
    ...medicine,
    id: parseInt(id),
    userId: config.DEFAULT_USER_ID
  };
}

// Delete a medicine
export async function deleteMedicine(id) {
  console.log(`Deleting medicine with ID: ${id}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, we would remove the medicine from dummyMedicines
  // For demonstration, we'll just return success
  return { success: true };
}

// Mark medicine as taken
export async function markMedicineAsTaken(medicineId, date, timeSlot) {
  console.log(`Marking medicine ${medicineId} as taken at ${timeSlot} on ${date}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // In a real implementation, we would update the taken status in dummyMedicines
  // For demonstration, we'll just return success
  return { 
    success: true,
    medicineId,
    date,
    timeSlot,
    taken: true 
  };
}

// Mark medicine as untaken
export async function markMedicineAsUntaken(medicineId, date, timeSlot) {
  console.log(`Marking medicine ${medicineId} as untaken at ${timeSlot} on ${date}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // In a real implementation, we would update the taken status in dummyMedicines
  // For demonstration, we'll just return success
  return { 
    success: true,
    medicineId,
    date,
    timeSlot,
    taken: false 
  };
}

// Get adherence statistics
export async function getAdherenceStats() {
  console.log('Getting dummy adherence stats');
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return { 
    adherenceRate: 85, 
    activeMedicines: dummyMedicines.length 
  };
}
