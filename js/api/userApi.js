
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
    preferences: {
      reminderEnabled: true,
      darkMode: false
    }
  };
}
