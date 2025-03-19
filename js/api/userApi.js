
// User Profile API operations
import config from '../config.js';

// Get user profile information
export async function getUserProfile() {
  try {
    console.log('Fetching user profile from:', `${config.API_BASE_URL}/users/profile?userId=${config.DEFAULT_USER_ID}`);
    const response = await fetch(`${config.API_BASE_URL}/users/profile?userId=${config.DEFAULT_USER_ID}`);
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('User profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { 
      id: config.DEFAULT_USER_ID,
      name: "Default User", 
      email: "user@example.com" 
    };
  }
}
