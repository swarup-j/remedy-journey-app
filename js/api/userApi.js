
// User Profile API operations
import config from '../config.js';

// Get user profile information
export async function getUserProfile() {
  try {
    const response = await fetch(`${config.API_BASE_URL}/users/profile?userId=${config.DEFAULT_USER_ID}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { 
      id: config.DEFAULT_USER_ID,
      name: "Default User", 
      email: "user@example.com" 
    };
  }
}
