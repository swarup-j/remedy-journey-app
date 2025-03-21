
// User Profile API operations
import config from '../config.js';

// Get user profile information
export async function getUserProfile() {
  console.log('Using dummy user profile data instead of API');
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { 
    id: config.DEFAULT_USER_ID,
    name: "John Doe", 
    email: "john.doe@example.com",
    joinDate: "2023-01-15",
    age: 32,
    height: 175,
    weight: 70,
    bloodGroup: "O+",
    preferences: {
      reminderEnabled: true,
      darkMode: false
    }
  };
}

// Get adherence statistics
export async function getAdherenceStats() {
  console.log('Getting adherence stats from dummy data');
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    adherenceRate: 85,
    activeMedicines: 3,
    missedDoses: 2,
    perfectDays: 5
  };
}
