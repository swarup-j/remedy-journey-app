
// Home page initialization and functionality
import { fetchMedicines, markMedicineAsTaken, markMedicineAsUntaken } from '../api/medicineApi.js';
import { showToast } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the home page
  initializeHomePage();
});

// Initialize the home page
async function initializeHomePage() {
  // Set current date
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    currentDateElement.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
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
  
  // Modern loading spinner
  todayList.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-wrapper">
        <div class="spinner-circle"></div>
      </div>
    </div>
  `;
  
  try {
    console.log('Fetching medicines for today...');
    const medicines = await fetchMedicines();
    console.log('Medicines received:', medicines);
    
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' });
    const todayStr = getCurrentDate();
    
    // Filter medicines for today
    const todaysMedicines = medicines.filter(medicine => {
      // If startDate or endDate are missing, include the medicine anyway
      const hasValidDates = medicine.startDate && medicine.endDate;
      if (!hasValidDates) return true;
      
      return (
        new Date(medicine.startDate) <= today &&
        new Date(medicine.endDate) >= today &&
        medicine.days.includes(dayOfWeek)
      );
    });
    
    console.log('Today\'s medicines:', todaysMedicines);
    
    if (todaysMedicines.length === 0) {
      todayList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-prescription-bottle-alt"></i>
          <p>No medications scheduled for today.</p>
        </div>
      `;
      return;
    }
    
    // Clear the loading spinner
    todayList.innerHTML = '';
    
    // Get taken medicines for today
    const takenMeds = JSON.parse(localStorage.getItem('meditrack_taken_meds') || '[]');
    const todayTakenMeds = takenMeds.filter(item => item.date === todayStr);
    
    // Display each medicine with modern card design
    todaysMedicines.forEach(medicine => {
      const medicineCard = document.createElement('div');
      medicineCard.classList.add('medicine-card');
      
      // Check if medicine has been taken
      const timeSlotStatus = medicine.timeSlots.map(timeSlot => {
        const taken = todayTakenMeds.some(item => 
          item.medicineId === medicine.id && item.timeSlot === timeSlot
        ) || (medicine.taken && medicine.taken.some(t => t.timeSlot === timeSlot && t.taken));
        
        return { timeSlot, taken };
      });
      
      // Create modern medicine card
      medicineCard.innerHTML = `
        <div class="medicine-color" style="background-color: ${medicine.color}"></div>
        <div class="medicine-info">
          <h3>${medicine.name}</h3>
          <p class="medicine-type">${medicine.type}</p>
          <div class="time-slots">
            ${timeSlotStatus.map(slot => `
              <div class="time-slot ${slot.taken ? 'taken' : ''}">
                <span><i class="far fa-clock"></i> ${slot.timeSlot}</span>
                <button class="take-btn ${slot.taken ? 'taken' : ''}" data-time="${slot.timeSlot}" data-id="${medicine.id}" data-status="${slot.taken ? 'taken' : 'not-taken'}">
                  ${slot.taken ? 
                    '<i class="fas fa-check"></i> Taken <i class="fas fa-undo toggle-icon"></i>' : 
                    '<i class="far fa-square"></i> Take'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      // Add to medicine list
      todayList.appendChild(medicineCard);
      
      // Add event listeners to take/untake buttons
      const actionButtons = medicineCard.querySelectorAll('.take-btn');
      actionButtons.forEach(button => {
        button.addEventListener('click', handleMedicineAction);
      });
    });
    
  } catch (error) {
    console.error('Error loading medicines:', error);
    todayList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load medications. Please try again.</p>
      </div>
    `;
  }
}

// Handle take or untake medicine button click
async function handleMedicineAction(event) {
  const button = event.currentTarget;
  const medicineId = parseInt(button.dataset.id);
  const timeSlot = button.dataset.time;
  const currentStatus = button.dataset.status;
  const today = getCurrentDate();
  
  try {
    button.disabled = true;
    
    if (currentStatus === 'taken') {
      // Currently taken, so untake it
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      await markMedicineAsUntaken(medicineId, today, timeSlot);
      
      // Update UI for untaken state
      button.innerHTML = '<i class="far fa-square"></i> Take';
      button.classList.remove('taken');
      button.dataset.status = 'not-taken';
      button.closest('.time-slot').classList.remove('taken');
      
      showToast('Medicine marked as not taken');
      
      // Update local storage
      updateLocalStorage(medicineId, timeSlot, today, false);
    } else {
      // Currently not taken, so take it
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      await markMedicineAsTaken(medicineId, today, timeSlot);
      
      // Update UI for taken state
      button.innerHTML = '<i class="fas fa-check"></i> Taken <i class="fas fa-undo toggle-icon"></i>';
      button.classList.add('taken');
      button.dataset.status = 'taken';
      button.closest('.time-slot').classList.add('taken');
      
      showToast('Medicine marked as taken!');
      
      // Update local storage
      updateLocalStorage(medicineId, timeSlot, today, true);
    }
    
    button.disabled = false;
  } catch (error) {
    console.error('Error updating medicine status:', error);
    button.disabled = false;
    button.innerHTML = currentStatus === 'taken' ? 
      '<i class="fas fa-check"></i> Taken <i class="fas fa-undo toggle-icon"></i>' : 
      '<i class="far fa-square"></i> Take';
    showToast('Failed to update medicine status. Please try again.');
  }
}

// Update localStorage with medicine taken status
function updateLocalStorage(medicineId, timeSlot, date, isTaken) {
  const takenMeds = JSON.parse(localStorage.getItem('meditrack_taken_meds') || '[]');
  
  // Remove existing entry if any
  const filteredMeds = takenMeds.filter(
    item => !(item.medicineId === medicineId && item.timeSlot === timeSlot && item.date === date)
  );
  
  // Add new entry if taken
  if (isTaken) {
    filteredMeds.push({
      medicineId,
      timeSlot,
      date,
      takenAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem('meditrack_taken_meds', JSON.stringify(filteredMeds));
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
    let displayHour = nextHour > 12 ? nextHour - 12 : nextHour;
    if (displayHour === 0) displayHour = 12;
    
    nextHours.push({
      time: `${displayHour}:${minutes < 10 ? '0' + minutes : minutes}`,
      label: nextHour < 12 ? 'AM' : 'PM',
      meds: i === 1 ? 2 : (i === 2 ? 1 : 0) // Demo data
    });
  }
  
  // Create modern timeline items
  timeline.innerHTML = nextHours.map(hour => `
    <div class="timeline-item">
      <div class="time">
        <div class="hour">${hour.time}</div>
        <div class="period">${hour.label}</div>
      </div>
      <div class="timeline-content">
        <div class="timeline-pills ${hour.meds > 0 ? '' : 'empty'}">
          ${hour.meds > 0 
            ? `<i class="fas fa-pills"></i> ${hour.meds} medication${hour.meds > 1 ? 's' : ''}` 
            : '<i class="fas fa-pills"></i> No medications'}
        </div>
      </div>
    </div>
  `).join('');
}

// Get current date as YYYY-MM-DD
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}
