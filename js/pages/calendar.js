
// Calendar page initialization and functionality
import { fetchMedicines } from '../api/medicineApi.js';
import { setupOfflineDetection, formatDate } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Initialize calendar page
  initializeCalendarPage();
});

async function initializeCalendarPage() {
  let currentDate = new Date();
  
  // Set current date
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    currentDateElement.textContent = currentDate.toLocaleDateString();
  }
  
  // Display calendar for current month
  displayCalendar(currentDate.getFullYear(), currentDate.getMonth());
  
  // Display schedule for today
  displayScheduleForDate(currentDate.toISOString().slice(0, 10));
  
  // Set up navigation buttons
  document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
  
  document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
}

// Display calendar for a given month and year
function displayCalendar(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay(); // Day of the week (0=Sunday, 1=Monday, etc.)
  
  const calendarDaysContainer = document.getElementById('calendar-days');
  calendarDaysContainer.innerHTML = ''; // Clear previous calendar
  
  const monthYearHeader = document.getElementById('calendar-month-year');
  monthYearHeader.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
  
  let dayCounter = 1;
  
  // Add empty boxes for days before the first day of the month
  for (let i = 0; i < startDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.classList.add('calendar-day', 'empty');
    calendarDaysContainer.appendChild(emptyDay);
  }
  
  // Add the days of the month
  while (dayCounter <= daysInMonth) {
    const calendarDay = document.createElement('div');
    calendarDay.classList.add('calendar-day');
    
    // Check if it's today's date
    const currentDate = new Date();
    if (
      dayCounter === currentDate.getDate() &&
      month === currentDate.getMonth() &&
      year === currentDate.getFullYear()
    ) {
      calendarDay.classList.add('today');
    }
    
    calendarDay.textContent = dayCounter;
    calendarDay.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
    
    calendarDay.addEventListener('click', function() {
      const selectedDate = this.dataset.date;
      
      // Remove selected class from all days
      document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
      });
      
      // Add selected class to clicked day
      this.classList.add('selected');
      
      displayScheduleForDate(selectedDate);
    });
    
    calendarDaysContainer.appendChild(calendarDay);
    dayCounter++;
  }
  
  // Mark today if it's in the current month view
  const today = new Date();
  if (today.getFullYear() === year && today.getMonth() === month) {
    const todayDay = document.querySelector(`.calendar-day:not(.empty):nth-child(${startDay + today.getDate()})`);
    if (todayDay) {
      todayDay.classList.add('today');
      todayDay.classList.add('selected'); // Also select today by default
    }
  }
  
  // Add medicine indicators (dots) after calendar is built
  addMedicineIndicatorsToCalendar(year, month);
}

// Add medicine indicators to calendar
async function addMedicineIndicatorsToCalendar(year, month) {
  try {
    const medicines = await fetchMedicines();
    
    // Process each day in the current month
    const calendarDays = document.querySelectorAll('.calendar-day:not(.empty)');
    
    calendarDays.forEach(dayElement => {
      const dateStr = dayElement.dataset.date;
      if (!dateStr) return;
      
      const date = new Date(dateStr);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count medicines scheduled for this day
      const medicinesCount = medicines.filter(medicine => {
        const startDate = new Date(medicine.startDate);
        const endDate = new Date(medicine.endDate);
        
        return (
          date >= startDate &&
          date <= endDate &&
          medicine.days.includes(dayOfWeek)
        );
      }).length;
      
      // Add indicator if there are medicines scheduled
      if (medicinesCount > 0) {
        const indicator = document.createElement('div');
        indicator.classList.add('medicine-indicator');
        
        // Add different colors based on the number of medicines
        if (medicinesCount >= 3) {
          indicator.classList.add('many');
        } else if (medicinesCount === 2) {
          indicator.classList.add('medium');
        }
        
        dayElement.appendChild(indicator);
      }
    });
  } catch (error) {
    console.error('Error adding medicine indicators:', error);
  }
}

// Display schedule for a given date
async function displayScheduleForDate(date) {
  const selectedDateHeader = document.getElementById('selected-date');
  selectedDateHeader.textContent = formatDate(date);
  
  const scheduleListContainer = document.getElementById('schedule-list');
  scheduleListContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
  
  try {
    // Fetch medicines and filter based on the selected date
    const medicines = await fetchMedicines();
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dailySchedule = medicines.filter(medicine => {
      if (!medicine.days || medicine.days.length === 0) return false;
      
      const startDate = new Date(medicine.startDate);
      const endDate = new Date(medicine.endDate);
      
      return (
        dateObj >= startDate &&
        dateObj <= endDate &&
        medicine.days.includes(dayOfWeek)
      );
    });
    
    scheduleListContainer.innerHTML = ''; // Clear loading spinner
    
    if (dailySchedule.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.classList.add('schedule-empty-state');
      emptyState.innerHTML = `
        <i class="fas fa-calendar-day"></i>
        <p>No medicines scheduled for this day.</p>
      `;
      scheduleListContainer.appendChild(emptyState);
      return;
    }
    
    // Group medicines by time slot
    const timeSlotGroups = {};
    
    dailySchedule.forEach(medicine => {
      medicine.timeSlots.forEach(timeSlot => {
        if (!timeSlotGroups[timeSlot]) {
          timeSlotGroups[timeSlot] = [];
        }
        timeSlotGroups[timeSlot].push(medicine);
      });
    });
    
    // Sort time slots
    const sortedTimeSlots = Object.keys(timeSlotGroups).sort();
    
    // Display each time slot group
    sortedTimeSlots.forEach(timeSlot => {
      const timeSlotHeader = document.createElement('div');
      timeSlotHeader.classList.add('time-slot-header');
      timeSlotHeader.textContent = timeSlot;
      scheduleListContainer.appendChild(timeSlotHeader);
      
      timeSlotGroups[timeSlot].forEach(medicine => {
        const scheduleItem = document.createElement('div');
        scheduleItem.classList.add('schedule-item');
        
        scheduleItem.innerHTML = `
          <div class="medicine-color" style="background-color: ${medicine.color}"></div>
          <div class="schedule-item-details">
            <h4>${medicine.name}</h4>
            <p>${medicine.type}</p>
          </div>
        `;
        
        scheduleListContainer.appendChild(scheduleItem);
      });
    });
    
  } catch (error) {
    console.error('Error displaying schedule:', error);
    scheduleListContainer.innerHTML = '<p class="error-message">Failed to load schedule. Please try again.</p>';
  }
}
