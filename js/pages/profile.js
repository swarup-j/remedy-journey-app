
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
const logoutBtn = document.getElementById('logout-btn');

// Find Doctor Modal Elements
const findDoctorBtn = document.getElementById('find-doctor-btn');
const findDoctorModal = document.getElementById('find-doctor-modal');
const closeDoctorModal = document.getElementById('close-doctor-modal');
const searchDoctorsBtn = document.getElementById('search-doctors-btn');
const doctorsResults = document.getElementById('doctors-results');

// Display current date
if (currentDateElement) {
  currentDateElement.textContent = formatDate(new Date());
}

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

// Logout functionality
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Clear any stored session/user data
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    
    // Show toast message
    showToast('Logged out successfully');
    
    // Redirect to login page after short delay
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
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

// Fetch doctors from API
async function fetchDoctors(specialty, location) {
  // This would normally be an API call
  // For demo purposes, we'll simulate an API response
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulated API response
      resolve([
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          distance: '2.3 miles away',
          rating: 4.8,
          reviews: 56,
          image: 'https://randomuser.me/api/portraits/women/68.jpg'
        },
        {
          id: 2,
          name: 'Dr. Michael Chen',
          specialty: 'Cardiologist',
          distance: '3.1 miles away',
          rating: 4.6,
          reviews: 42,
          image: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
          id: 3,
          name: 'Dr. Lisa Thompson',
          specialty: 'Cardiologist',
          distance: '4.7 miles away',
          rating: 4.9,
          reviews: 38,
          image: 'https://randomuser.me/api/portraits/women/24.jpg'
        }
      ]);
    }, 1500);
  });
}

if (searchDoctorsBtn) {
  searchDoctorsBtn.addEventListener('click', async () => {
    const specialty = document.getElementById('specialty').value;
    const location = document.getElementById('location').value;
    
    if (!specialty || !location) {
      showToast('Please select a specialty and enter a location');
      return;
    }
    
    // Show loading indicator
    doctorsResults.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    doctorsResults.classList.remove('hidden');
    
    try {
      // Fetch doctors from API
      const doctors = await fetchDoctors(specialty, location);
      
      if (doctors.length === 0) {
        doctorsResults.innerHTML = `
          <div class="empty-state">
            <p>No doctors found matching your criteria</p>
          </div>
        `;
        return;
      }
      
      // Display doctor results
      doctorsResults.innerHTML = doctors.map(doctor => `
        <div class="doctor-card">
          <div class="doctor-avatar">
            <img src="${doctor.image}" alt="${doctor.name}">
          </div>
          <div class="doctor-info">
            <h4>${doctor.name}</h4>
            <p>${doctor.specialty}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${doctor.distance}</p>
            <p><i class="fas fa-star"></i> ${doctor.rating} (${doctor.reviews} reviews)</p>
          </div>
          <button class="secondary-btn book-appointment" data-id="${doctor.id}">Book Appointment</button>
        </div>
      `).join('');
      
      // Add event listeners to book appointment buttons
      const bookButtons = doctorsResults.querySelectorAll('.book-appointment');
      bookButtons.forEach(button => {
        button.addEventListener('click', () => {
          const doctorId = button.dataset.id;
          showToast(`Appointment request sent for doctor #${doctorId}`);
          // This would normally call an API to book the appointment
        });
      });
      
    } catch (error) {
      console.error('Error fetching doctors:', error);
      doctorsResults.innerHTML = `
        <div class="error-state">
          <p>Failed to find doctors. Please try again.</p>
        </div>
      `;
    }
  });
}

// Initialize page
loadUserProfile();
