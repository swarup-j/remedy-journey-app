
// Home page initialization and functionality
import { fetchMedicines, markMedicineAsTaken } from '../api/medicineApi.js';
import { showToast, setupOfflineDetection, getCurrentDate } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Initialize the home page
  initializeHomePage();
});

// Initialize the home page
async function initializeHomePage() {
  // Set current date
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    currentDateElement.textContent = new Date().toLocaleDateString();
  }
  
  // Set greeting based on time of day
  setGreeting();
  
  // Load today's medicines
  await loadTodaysMedicines();
  
  // Initialize upcoming timeline
  initializeUpcomingTimeline();
}

// Set greeting message based on time of day
function setGreeting() {
  const greetingElement = document.getElementById('greeting');
  if (!greetingElement) return;
  
  const hour = new Date().getHours();
  let greeting = 'Good ';
  
  if (hour < 12) {
    greeting += 'morning';
  } else if (hour < 18) {
    greeting += 'afternoon';
  } else {
    greeting += 'evening';
  }
  
  greetingElement.textContent = `${greeting}!`;
}

// Load today's medicines
async function loadTodaysMedicines() {
  const todayList = document.getElementById('today-list');
  if (!todayList) return;
  
  todayList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
  
  try {
    const medicines = await fetchMedicines();
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' });
    const todayStr = getCurrentDate();
    
    // Filter medicines for today
    const todaysMedicines = medicines.filter(medicine => {
      return (
        new Date(medicine.startDate) <= today &&
        new Date(medicine.endDate) >= today &&
        medicine.days.includes(dayOfWeek)
      );
    });
    
    if (todaysMedicines.length === 0) {
      todayList.innerHTML = '<p class="no-meds-message">No medications scheduled for today.</p>';
      return;
    }
    
    // Clear the loading spinner
    todayList.innerHTML = '';
    
    // Get taken medicines for today
    const takenMeds = JSON.parse(localStorage.getItem('meditrack_taken_meds') || '[]');
    const todayTakenMeds = takenMeds.filter(item => item.date === todayStr);
    
    // Display each medicine
    todaysMedicines.forEach(medicine => {
      const medicineCard = document.createElement('div');
      medicineCard.classList.add('medicine-card');
      
      // Check if medicine has been taken
      const timeSlotStatus = medicine.timeSlots.map(timeSlot => {
        const taken = todayTakenMeds.some(item => 
          item.medicineId === medicine.id && item.timeSlot === timeSlot
        );
        
        return { timeSlot, taken };
      });
      
      medicineCard.innerHTML = `
        <div class="medicine-color" style="background-color: ${medicine.color}"></div>
        <div class="medicine-info">
          <h3>${medicine.name}</h3>
          <p class="medicine-type">${medicine.type}</p>
          <div class="time-slots">
            ${timeSlotStatus.map(slot => `
              <div class="time-slot ${slot.taken ? 'taken' : ''}">
                <span>${slot.timeSlot}</span>
                <button class="take-btn" data-time="${slot.timeSlot}" data-id="${medicine.id}" ${slot.taken ? 'disabled' : ''}>
                  ${slot.taken ? '<i class="fas fa-check"></i>' : 'Take'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      // Add to medicine list
      todayList.appendChild(medicineCard);
      
      // Add event listeners to take buttons
      const takeButtons = medicineCard.querySelectorAll('.take-btn');
      takeButtons.forEach(button => {
        if (!button.disabled) {
          button.addEventListener('click', handleTakeMedicine);
        }
      });
    });
    
  } catch (error) {
    console.error('Error loading medicines:', error);
    todayList.innerHTML = '<p class="error-message">Failed to load medications. Please try again.</p>';
  }
}

// Handle take medicine button click
async function handleTakeMedicine(event) {
  const button = event.currentTarget;
  const medicineId = button.dataset.id;
  const timeSlot = button.dataset.time;
  const today = getCurrentDate();
  
  try {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Mark medicine as taken
    await markMedicineAsTaken(parseInt(medicineId), today, timeSlot);
    
    // Update UI
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.closest('.time-slot').classList.add('taken');
    
    showToast('Medicine marked as taken!');
  } catch (error) {
    console.error('Error marking medicine as taken:', error);
    button.disabled = false;
    button.textContent = 'Take';
    showToast('Failed to mark medicine as taken. Please try again.');
  }
}

// Initialize upcoming timeline
function initializeUpcomingTimeline() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  
  // For demo purposes, show some upcoming times
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Generate next few hours
  let nextHours = [];
  for (let i = 1; i <= 3; i++) {
    let nextHour = (hours + i) % 24;
    nextHours.push({
      time: `${nextHour}:${minutes < 10 ? '0' + minutes : minutes}`,
      label: nextHour < 12 ? 'AM' : 'PM',
      meds: i === 1 ? 2 : (i === 2 ? 1 : 0) // Demo data
    });
  }
  
  // Create timeline items
  timeline.innerHTML = nextHours.map(hour => `
    <div class="timeline-item">
      <div class="timeline-time">
        <div class="time">${hour.time}</div>
        <div class="ampm">${hour.label}</div>
      </div>
      <div class="timeline-content">
        ${hour.meds > 0 
          ? `<div class="timeline-pills">${hour.meds} medication${hour.meds > 1 ? 's' : ''}</div>` 
          : '<div class="timeline-pills empty">No medications</div>'}
      </div>
    </div>
  `).join('');
}
