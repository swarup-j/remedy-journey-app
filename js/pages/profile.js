
// Profile page initialization and functionality
import { getUserProfile, getAdherenceStats } from '../api/userApi.js';
import { fetchMedicines } from '../api/medicineApi.js';
import { showToast, setupOfflineDetection } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Initialize profile page
  initializeProfilePage();

  // Setup doctor finder modal
  setupDoctorFinderModal();
});

async function initializeProfilePage() {
  try {
    // Set current date
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
      currentDateElement.textContent = new Date().toLocaleDateString();
    }
    
    // Fetch user profile
    const profile = await getUserProfile();
    
    // Update UI with user info
    document.getElementById('user-name').textContent = profile.name || 'User';
    document.getElementById('user-email').textContent = profile.email || 'No email';
    
    // Update additional user information
    document.getElementById('user-age').textContent = profile.age || '30';
    document.getElementById('user-height').textContent = (profile.height ? `${profile.height} cm` : 'Not set');
    document.getElementById('user-weight').textContent = (profile.weight ? `${profile.weight} kg` : 'Not set');
    document.getElementById('user-blood-group').textContent = profile.bloodGroup || 'Not set';
    
    // Fetch adherence statistics
    const stats = await getAdherenceStats();
    
    // Update UI with statistics
    const adherenceElement = document.getElementById('adherence-rate');
    if (adherenceElement) {
      adherenceElement.textContent = stats.adherenceRate !== undefined ? `${stats.adherenceRate}%` : 'N/A';
      
      // Add adherence rating text
      const adherenceRating = document.querySelector('.stat-detail');
      if (adherenceRating) {
        if (stats.adherenceRate >= 90) {
          adherenceRating.textContent = 'Excellent';
          adherenceRating.style.color = '#4CAF50';
        } else if (stats.adherenceRate >= 70) {
          adherenceRating.textContent = 'Good';
          adherenceRating.style.color = '#FFC107';
        } else {
          adherenceRating.textContent = 'Needs Improvement';
          adherenceRating.style.color = '#F44336';
        }
      }
    }
    
    document.getElementById('active-medications').textContent = 
      stats.activeMedicines !== undefined ? stats.activeMedicines : 'N/A';
    
    // Load medicine summary
    await loadMedicineSummary();
    
  } catch (error) {
    console.error('Error loading profile data:', error);
    showToast('Error loading profile data');
  }
}

// Load medicine summary for profile page
async function loadMedicineSummary() {
  const summaryContainer = document.getElementById('medicine-summary');
  if (!summaryContainer) return;
  
  try {
    const medicines = await fetchMedicines();
    
    if (medicines.length === 0) {
      summaryContainer.innerHTML = '<p>No medicines found.</p>';
      return;
    }
    
    // Count by type
    const typeCount = {};
    medicines.forEach(medicine => {
      if (!typeCount[medicine.type]) {
        typeCount[medicine.type] = 0;
      }
      typeCount[medicine.type]++;
    });
    
    // Create pie chart (simplified version)
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('simple-pie-chart');
    
    const chartLegend = document.createElement('div');
    chartLegend.classList.add('chart-legend');
    
    // Standard colors for medicine types
    const colors = {
      'tablet': '#FF6384',
      'capsule': '#36A2EB',
      'liquid': '#FFCE56',
      'injection': '#4BC0C0',
      'topical': '#9966FF',
      'other': '#C9CBCF'
    };
    
    // Add legend items
    Object.entries(typeCount).forEach(([type, count]) => {
      const color = colors[type.toLowerCase()] || colors.other;
      
      const legendItem = document.createElement('div');
      legendItem.classList.add('legend-item');
      legendItem.innerHTML = `
        <span class="legend-color" style="background-color: ${color}"></span>
        <span class="legend-label">${type} (${count})</span>
      `;
      
      chartLegend.appendChild(legendItem);
    });
    
    // Add chart and legend to container
    summaryContainer.innerHTML = '<h3>Medicine Types</h3>';
    summaryContainer.appendChild(chartContainer);
    summaryContainer.appendChild(chartLegend);
    
  } catch (error) {
    console.error('Error loading medicine summary:', error);
    summaryContainer.innerHTML = '<p>Failed to load medicine summary.</p>';
  }
}

// Setup doctor finder modal functionality
function setupDoctorFinderModal() {
  const findDoctorBtn = document.getElementById('find-doctor-btn');
  const doctorModal = document.getElementById('find-doctor-modal');
  const closeModalBtn = document.getElementById('close-doctor-modal');
  const searchDoctorsBtn = document.getElementById('search-doctors-btn');
  const doctorsResults = document.getElementById('doctors-results');
  
  // Open modal
  findDoctorBtn.addEventListener('click', () => {
    doctorModal.style.display = 'flex';
  });
  
  // Close modal
  closeModalBtn.addEventListener('click', () => {
    doctorModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === doctorModal) {
      doctorModal.style.display = 'none';
    }
  });
  
  // Search for doctors (dummy implementation)
  searchDoctorsBtn.addEventListener('click', () => {
    const specialty = document.getElementById('specialty').value;
    const location = document.getElementById('location').value;
    
    // Show loading
    doctorsResults.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    doctorsResults.classList.remove('hidden');
    
    // Simulate API call
    setTimeout(() => {
      displayDummyDoctorResults(specialty, location);
    }, 1000);
  });
}

// Display dummy doctor results
function displayDummyDoctorResults(specialty, location) {
  const doctorsResults = document.getElementById('doctors-results');
  
  // Create dummy doctor data
  const doctors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "General Practitioner",
      location: "Medical Center, Downtown",
      rating: 4.8,
      available: true
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Cardiology",
      location: "Heart Institute, Westside",
      rating: 4.9,
      available: false
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Neurology",
      location: "Neuro Center, Eastside",
      rating: 4.7,
      available: true
    }
  ];
  
  // Filter doctors based on selection (very simple filter)
  let filteredDoctors = doctors;
  if (specialty) {
    filteredDoctors = filteredDoctors.filter(doc => 
      doc.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
  
  if (location) {
    filteredDoctors = filteredDoctors.filter(doc => 
      doc.location.toLowerCase().includes(location.toLowerCase()));
  }
  
  // Display results
  if (filteredDoctors.length === 0) {
    doctorsResults.innerHTML = '<p>No doctors found matching your criteria.</p>';
    return;
  }
  
  // Create results HTML
  let resultsHTML = '<div class="doctors-list">';
  
  filteredDoctors.forEach(doctor => {
    resultsHTML += `
      <div class="doctor-card">
        <div class="doctor-info">
          <h4>${doctor.name}</h4>
          <p>${doctor.specialty}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${doctor.location}</p>
          <p><i class="fas fa-star"></i> ${doctor.rating}</p>
        </div>
        <button class="appointment-btn ${!doctor.available ? 'disabled' : ''}">
          ${doctor.available ? 'Book Appointment' : 'Not Available'}
        </button>
      </div>
    `;
  });
  
  resultsHTML += '</div>';
  doctorsResults.innerHTML = resultsHTML;
  
  // Add event listeners to appointment buttons
  const appointmentButtons = doctorsResults.querySelectorAll('.appointment-btn:not(.disabled)');
  appointmentButtons.forEach(button => {
    button.addEventListener('click', () => {
      showToast('Appointment booking would open here');
    });
  });
}
