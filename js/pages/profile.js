
import { showToast, formatDate } from '../utils.js';
import { getUserProfile, getAdherenceStats } from '../api/userApi.js';

// DOM Elements
const currentDateElement = document.getElementById('current-date');
const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');
const userAgeElement = document.getElementById('user-age');
const userHeightElement = document.getElementById('user-height');
const userWeightElement = document.getElementById('user-weight');
const userBloodGroupElement = document.getElementById('user-blood-group');
const adherenceRateElement = document.getElementById('adherence-rate');
const activeMedicationsElement = document.getElementById('active-medications');
const medicineSummaryElement = document.getElementById('medicine-summary');

// Find Doctor Modal Elements
const findDoctorBtn = document.getElementById('find-doctor-btn');
const findDoctorModal = document.getElementById('find-doctor-modal');
const closeDoctorModal = document.getElementById('close-doctor-modal');
const searchDoctorsBtn = document.getElementById('search-doctors-btn');
const doctorsResults = document.getElementById('doctors-results');

// Display current date
currentDateElement.textContent = formatDate(new Date());

// Fetch and display user profile
async function loadUserProfile() {
  try {
    const profile = await getUserProfile();
    
    // Update profile information
    userNameElement.textContent = `${profile.name}`;
    userEmailElement.textContent = profile.email;
    userAgeElement.textContent = profile.age;
    userHeightElement.textContent = `${profile.height} cm`;
    userWeightElement.textContent = `${profile.weight} kg`;
    userBloodGroupElement.textContent = profile.bloodGroup;
    
    // Load adherence stats
    const stats = await getAdherenceStats();
    adherenceRateElement.textContent = `${stats.adherenceRate}%`;
    activeMedicationsElement.textContent = stats.activeMedicines;
    
    // Update medicine summary
    loadMedicineSummary();
    
  } catch (error) {
    console.error('Error loading profile:', error);
    medicineSummaryElement.innerHTML = `
      <div class="error-state">
        <p>Failed to load profile data</p>
        <button onclick="loadUserProfile()" class="secondary-btn">
          <i class="fas fa-sync"></i> Try Again
        </button>
      </div>
    `;
  }
}

// Load medicine summary
function loadMedicineSummary() {
  // This would normally fetch from an API
  // For now we'll use dummy data
  setTimeout(() => {
    medicineSummaryElement.innerHTML = `
      <div class="medicine-summary-list">
        <div class="medicine-summary-item">
          <div class="medicine-summary-icon" style="background-color: #8BC34A">
            <i class="fas fa-pills"></i>
          </div>
          <div class="medicine-summary-info">
            <h4>Lisinopril</h4>
            <p>10mg - Once daily</p>
          </div>
          <div class="medicine-summary-adherence">
            <span>95%</span>
          </div>
        </div>
        <div class="medicine-summary-item">
          <div class="medicine-summary-icon" style="background-color: #42A5F5">
            <i class="fas fa-pills"></i>
          </div>
          <div class="medicine-summary-info">
            <h4>Metformin</h4>
            <p>500mg - Twice daily</p>
          </div>
          <div class="medicine-summary-adherence">
            <span>87%</span>
          </div>
        </div>
        <div class="medicine-summary-item">
          <div class="medicine-summary-icon" style="background-color: #FFA726">
            <i class="fas fa-pills"></i>
          </div>
          <div class="medicine-summary-info">
            <h4>Vitamin D</h4>
            <p>1000IU - Once daily</p>
          </div>
          <div class="medicine-summary-adherence">
            <span>100%</span>
          </div>
        </div>
      </div>
    `;
  }, 1000);
}

// Find Doctor Modal Functionality
if (findDoctorBtn) {
  findDoctorBtn.addEventListener('click', () => {
    findDoctorModal.style.display = 'flex';
  });
}

if (closeDoctorModal) {
  closeDoctorModal.addEventListener('click', () => {
    findDoctorModal.style.display = 'none';
  });
}

// Close modal when clicking outside content
window.addEventListener('click', (event) => {
  if (event.target === findDoctorModal) {
    findDoctorModal.style.display = 'none';
  }
});

if (searchDoctorsBtn) {
  searchDoctorsBtn.addEventListener('click', () => {
    const specialty = document.getElementById('specialty').value;
    const location = document.getElementById('location').value;
    
    if (!specialty || !location) {
      showToast('Please select a specialty and enter a location');
      return;
    }
    
    // Show loading indicator
    doctorsResults.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    doctorsResults.classList.remove('hidden');
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Display mock results
      doctorsResults.innerHTML = `
        <div class="doctor-card">
          <div class="doctor-info">
            <h4>Dr. Sarah Johnson</h4>
            <p>Cardiologist</p>
            <p><i class="fas fa-map-marker-alt"></i> 2.3 miles away</p>
            <p><i class="fas fa-star"></i> 4.8 (56 reviews)</p>
          </div>
          <button class="secondary-btn">Book Appointment</button>
        </div>
        <div class="doctor-card">
          <div class="doctor-info">
            <h4>Dr. Michael Chen</h4>
            <p>Cardiologist</p>
            <p><i class="fas fa-map-marker-alt"></i> 3.1 miles away</p>
            <p><i class="fas fa-star"></i> 4.6 (42 reviews)</p>
          </div>
          <button class="secondary-btn">Book Appointment</button>
        </div>
        <div class="doctor-card">
          <div class="doctor-info">
            <h4>Dr. Lisa Thompson</h4>
            <p>Cardiologist</p>
            <p><i class="fas fa-map-marker-alt"></i> 4.7 miles away</p>
            <p><i class="fas fa-star"></i> 4.9 (38 reviews)</p>
          </div>
          <button class="secondary-btn">Book Appointment</button>
        </div>
      `;
    }, 1500);
  });
}

// Initialize page
loadUserProfile();
