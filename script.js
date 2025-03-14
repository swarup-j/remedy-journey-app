// Import API module
import api from './api.js';
import { showToast, checkOnlineStatus, setupOfflineDetection, requireAuth } from './js/utils.js';

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Authentication check for protected pages
  const publicPages = ['login.html', 'register.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (!publicPages.includes(currentPage)) {
    // Require authentication for non-public pages
    if (!requireAuth()) {
      return; // Stop execution if not authenticated
    }
  }
  
  // Initialize page-specific functionality
  initializePage();
});

// Initialize page-specific functionality based on current page
function initializePage() {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
    initializeHomePage();
  } else if (currentPath.includes('medicine-list.html')) {
    initializeMedicineListPage();
  } else if (currentPath.includes('calendar.html')) {
    initializeCalendarPage();
  } else if (currentPath.includes('profile.html')) {
    initializeProfilePage();
  } else if (currentPath.includes('medicine-form.html')) {
    initializeMedicineFormPage();
  }
}

// Home Page
async function initializeHomePage() {
  // Redirect to login if not authenticated
  if (!requireAuth()) {
    return;
  }

  // Set current date
  const currentDateElement = document.getElementById('current-date');
  currentDateElement.textContent = new Date().toLocaleDateString();

  // Load medicines
  loadMedicines();
}

// Medicine List Page
async function initializeMedicineListPage() {
  // Redirect to login if not authenticated
  if (!requireAuth()) {
    return;
  }

  // Load medicines
  loadMedicines();
}

// Calendar Page
async function initializeCalendarPage() {
  // Redirect to login if not authenticated
  if (!requireAuth()) {
    return;
  }

  let currentDate = new Date();
  
  // Function to display the calendar for a given month and year
  function displayCalendar(year, month) {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay(); // Day of the week for the first day (0=Sunday, 1=Monday, etc.)
    
    const calendarDaysContainer = document.getElementById('calendar-days');
    calendarDaysContainer.innerHTML = ''; // Clear previous calendar
    
    const monthYearHeader = document.getElementById('calendar-month-year');
    monthYearHeader.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
    
    let dayCounter = 1;
    
    // Add empty boxes for the days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.classList.add('calendar-day', 'empty');
      calendarDaysContainer.appendChild(emptyDay);
    }
    
    // Add the days of the month
    while (dayCounter <= daysInMonth) {
      const calendarDay = document.createElement('div');
      calendarDay.classList.add('calendar-day');
      calendarDay.textContent = dayCounter;
      calendarDay.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
      
      calendarDay.addEventListener('click', function() {
        const selectedDate = this.dataset.date;
        displayScheduleForDate(selectedDate);
      });
      
      calendarDaysContainer.appendChild(calendarDay);
      dayCounter++;
    }
  }
  
  // Function to display the schedule for a given date
  async function displayScheduleForDate(date) {
    const selectedDateHeader = document.getElementById('selected-date');
    selectedDateHeader.textContent = new Date(date).toLocaleDateString();
    
    const scheduleListContainer = document.getElementById('schedule-list');
    scheduleListContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    
    // Fetch medicines and filter based on the selected date
    const medicines = await api.fetchMedicines();
    const dailySchedule = medicines.filter(medicine => {
      if (!medicine.days || medicine.days.length === 0) return false;
      
      const dayOfWeek = new Date(date).toLocaleDateString('default', { weekday: 'short' });
      return medicine.days.includes(dayOfWeek);
    });
    
    scheduleListContainer.innerHTML = ''; // Clear loading spinner
    
    if (dailySchedule.length === 0) {
      scheduleListContainer.textContent = 'No medicines scheduled for this day.';
      return;
    }
    
    // Display each medicine in the schedule
    dailySchedule.forEach(medicine => {
      const scheduleItem = document.createElement('div');
      scheduleItem.classList.add('schedule-item');
      
      const medicineName = document.createElement('h4');
      medicineName.textContent = medicine.name;
      
      const medicineTimeSlots = document.createElement('p');
      medicineTimeSlots.textContent = `Time: ${medicine.timeSlots.join(', ')}`;
      
      scheduleItem.appendChild(medicineName);
      scheduleItem.appendChild(medicineTimeSlots);
      scheduleListContainer.appendChild(scheduleItem);
    });
  }
  
  // Initial display
  displayCalendar(currentDate.getFullYear(), currentDate.getMonth());
  displayScheduleForDate(currentDate.toISOString().slice(0, 10));
  
  // Navigation buttons
  document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
  
  document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
}

// Profile Page
async function initializeProfilePage() {
  try {
    // Fetch user profile
    const profile = await api.getUserProfile();
    
    // Update UI with user info
    document.getElementById('user-name').textContent = profile.name || 'User';
    document.getElementById('user-email').textContent = profile.email || 'No email';
    
    // Fetch adherence statistics
    const stats = await api.getAdherenceStats();
    
    // Update UI with statistics
    document.getElementById('adherence-rate').textContent = 
      stats.adherenceRate !== undefined ? `${stats.adherenceRate}%` : 'N/A';
    document.getElementById('active-medications').textContent = 
      stats.activeMedicines !== undefined ? stats.activeMedicines : 'N/A';
    
  } catch (error) {
    console.error('Error loading profile data:', error);
    showToast('Error loading profile data');
  }
}

// Medicine Form Page
async function initializeMedicineFormPage() {
  // Redirect to login if not authenticated
  if (!requireAuth()) {
    return;
  }

  const form = document.getElementById('medicine-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const medicine = {
      name: document.getElementById('name').value,
      type: document.getElementById('type').value,
      dosage: document.getElementById('dosage').value,
      frequency: document.getElementById('frequency').value,
      timeSlots: Array.from(document.querySelectorAll('input[name="time"]:checked')).map(input => input.value),
      days: Array.from(document.querySelectorAll('input[name="day"]:checked')).map(input => input.value),
      duration: document.getElementById('duration').value,
      notes: document.getElementById('notes').value
    };

    try {
      const result = await api.addMedicine(medicine);
      if (result.error) {
        showToast(`Error: ${result.error}`);
      } else {
        showToast('Medicine added successfully!');
        form.reset(); // Clear the form
      }
    } catch (error) {
      console.error('Failed to add medicine:', error);
      showToast('Failed to add medicine.');
    }
  });
}

// Load Medicines
async function loadMedicines() {
  try {
    const medicines = await api.fetchMedicines();
    displayMedicines(medicines);
  } catch (error) {
    console.error('Failed to load medicines:', error);
    showToast('Failed to load medicines.');
  }
}

// Display Medicines
function displayMedicines(medicines) {
  const medicineList = document.getElementById('medicine-list');
  if (!medicineList) return;

  medicineList.innerHTML = ''; // Clear existing list

  if (medicines.length === 0) {
    medicineList.innerHTML = '<p>No medicines found.</p>';
    return;
  }

  medicines.forEach(medicine => {
    const medicineCard = document.createElement('div');
    medicineCard.classList.add('medicine-card');
    medicineCard.innerHTML = `
      <h3>${medicine.name}</h3>
      <p>Type: ${medicine.type}</p>
      <p>Dosage: ${medicine.dosage}</p>
      <p>Frequency: ${medicine.frequency}</p>
      <p>Time: ${medicine.timeSlots.join(', ')}</p>
      <p>Days: ${medicine.days.join(', ')}</p>
      <p>Duration: ${medicine.duration}</p>
      <p>Notes: ${medicine.notes}</p>
    `;
    medicineList.appendChild(medicineCard);
  });
}
