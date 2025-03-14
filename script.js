
document.addEventListener('DOMContentLoaded', function() {
  // Set current date
  const currentDate = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    dateElement.textContent = currentDate.toLocaleDateString('en-US', dateOptions);
  }

  // Set greeting based on time of day
  const greetingElement = document.getElementById('greeting-text');
  if (greetingElement) {
    const hour = currentDate.getHours();
    let greeting = 'Good Morning!';
    
    if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon!';
    } else if (hour >= 17) {
      greeting = 'Good Evening!';
    }
    
    greetingElement.textContent = `${greeting} How's your day?`;
  }

  // Search functionality
  const searchBtn = document.getElementById('search-btn');
  const closeSearchBtn = document.getElementById('close-search');
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');

  if (searchBtn && closeSearchBtn && searchContainer && searchInput) {
    searchBtn.addEventListener('click', function() {
      searchContainer.classList.remove('hidden');
      searchInput.focus();
    });

    closeSearchBtn.addEventListener('click', function() {
      searchContainer.classList.add('hidden');
      searchInput.value = '';
    });

    searchInput.addEventListener('keyup', function() {
      const searchTerm = searchInput.value.toLowerCase();
      const medicineList = document.getElementById('medicine-full-list');
      
      if (medicineList) {
        const medicines = medicineList.getElementsByClassName('medicine-item');
        
        Array.from(medicines).forEach(function(medicine) {
          const medicineName = medicine.querySelector('h3').textContent.toLowerCase();
          
          if (medicineName.includes(searchTerm)) {
            medicine.style.display = '';
          } else {
            medicine.style.display = 'none';
          }
        });
      }
    });
  }

  // Form handling for medicine form
  const medicineForm = document.getElementById('medicine-form');
  if (medicineForm) {
    const frequencySelect = document.getElementById('frequency');
    const addTimeSlotBtn = document.getElementById('add-time-slot');
    const timeSlotsContainer = document.getElementById('time-slots');

    // Add time slot
    addTimeSlotBtn.addEventListener('click', function() {
      const timeSlots = document.querySelectorAll('.time-slot');
      // Remove hidden class from previous remove buttons
      timeSlots.forEach(slot => {
        const removeBtn = slot.querySelector('.remove-time');
        if (removeBtn) {
          removeBtn.classList.remove('hidden');
        }
      });

      // Create new time slot
      const newTimeSlot = document.createElement('div');
      newTimeSlot.className = 'time-slot';
      newTimeSlot.innerHTML = `
        <input type="time" class="time-input" required>
        <button type="button" class="remove-time"><i class="fas fa-times"></i></button>
      `;
      
      timeSlotsContainer.appendChild(newTimeSlot);
      
      // Add event listener to new remove button
      const removeBtn = newTimeSlot.querySelector('.remove-time');
      removeBtn.addEventListener('click', function() {
        newTimeSlot.remove();
        
        // If only one time slot is left, hide its remove button
        const remainingTimeSlots = document.querySelectorAll('.time-slot');
        if (remainingTimeSlots.length === 1) {
          remainingTimeSlots[0].querySelector('.remove-time').classList.add('hidden');
        }
      });
    });

    // Handle form submission
    medicineForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const medicineName = document.getElementById('medicine-name').value;
      const dosage = document.getElementById('dosage').value;
      const frequency = document.getElementById('frequency').value;
      const duration = document.getElementById('duration').value;
      const notes = document.getElementById('notes').value;
      
      // Get time slots
      const timeInputs = document.querySelectorAll('.time-input');
      const times = Array.from(timeInputs).map(input => input.value);
      
      // Get days
      const dayCheckboxes = document.querySelectorAll('.day-selector input[type="checkbox"]:checked');
      const days = Array.from(dayCheckboxes).map(checkbox => checkbox.value);
      
      // Create medicine object
      const medicine = {
        id: Date.now().toString(),
        name: medicineName,
        dosage: dosage,
        frequency: frequency,
        times: times,
        days: days,
        duration: duration,
        notes: notes
      };
      
      // Save medicine to local storage
      saveMedicine(medicine);
      
      // Show confirmation toast
      showToast('Medicine added successfully!');
      
      // Redirect to medicine list
      setTimeout(() => {
        window.location.href = 'medicine-list.html';
      }, 1500);
    });
  }

  // Calendar functionality
  const calendarContainer = document.getElementById('calendar-container');
  if (calendarContainer) {
    renderCalendar(currentDate);
  }

  // Initialize medicine list
  const medicineListContainer = document.getElementById('medicine-full-list');
  if (medicineListContainer) {
    renderMedicineList();
  }

  // Initialize today's medicines
  const todayListContainer = document.getElementById('today-list');
  if (todayListContainer) {
    renderTodayMedicines();
  }
});

// Save medicine to local storage
function saveMedicine(medicine) {
  let medicines = JSON.parse(localStorage.getItem('medicines')) || [];
  medicines.push(medicine);
  localStorage.setItem('medicines', JSON.stringify(medicines));
}

// Get all medicines from local storage
function getMedicines() {
  return JSON.parse(localStorage.getItem('medicines')) || [];
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.style.display = 'flex';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

// Render calendar
function renderCalendar(date) {
  const calendarContainer = document.getElementById('calendar-container');
  if (!calendarContainer) return;
  
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  let calendarHTML = `
    <div class="calendar-header">
      <button id="prev-month" class="calendar-nav-btn"><i class="fas fa-chevron-left"></i></button>
      <h2>${monthNames[month]} ${year}</h2>
      <button id="next-month" class="calendar-nav-btn"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="calendar-days">
      <div class="weekday">Sun</div>
      <div class="weekday">Mon</div>
      <div class="weekday">Tue</div>
      <div class="weekday">Wed</div>
      <div class="weekday">Thu</div>
      <div class="weekday">Fri</div>
      <div class="weekday">Sat</div>
  `;
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
  }
  
  // Add cells for each day of the month
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === today.getDate() && 
                    month === today.getMonth() && 
                    year === today.getFullYear();
    
    calendarHTML += `
      <div class="calendar-day ${isToday ? 'today' : ''}">
        <span>${i}</span>
      </div>
    `;
  }
  
  calendarHTML += '</div>';
  
  calendarContainer.innerHTML = calendarHTML;
  
  // Add event listeners for navigation buttons
  document.getElementById('prev-month').addEventListener('click', () => {
    const newDate = new Date(year, month - 1, 1);
    renderCalendar(newDate);
  });
  
  document.getElementById('next-month').addEventListener('click', () => {
    const newDate = new Date(year, month + 1, 1);
    renderCalendar(newDate);
  });
  
  // Add event listeners for days
  document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
    day.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      day.classList.add('selected');
      
      const selectedDate = new Date(year, month, parseInt(day.textContent));
      document.getElementById('selected-date').textContent = selectedDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Here you would render medications for the selected date
      renderMedicinesForDate(selectedDate);
    });
  });
}

// Render medicines for a specific date
function renderMedicinesForDate(date) {
  const dayMedicationsContainer = document.getElementById('day-medications');
  if (!dayMedicationsContainer) return;
  
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
  const medicines = getMedicines();
  
  // Filter medicines for the selected day
  const dayMedicines = medicines.filter(med => med.days.includes(dayOfWeek));
  
  if (dayMedicines.length === 0) {
    dayMedicationsContainer.innerHTML = '<p class="no-medicines">No medications scheduled for this day.</p>';
    return;
  }
  
  let medicinesHTML = '';
  
  dayMedicines.forEach(med => {
    medicinesHTML += `
      <div class="medication-item" data-id="${med.id}">
        <img src="public/lovable-uploads/e55297b4-0990-479a-a0ad-003f2b59588c.png" alt="Pill" class="medication-pill-icon">
        <div class="medicine-info">
          <h3>${med.name}</h3>
          <p>${med.dosage}</p>
          <p>${med.times.join(', ')}</p>
        </div>
        <div class="medication-checkbox"></div>
      </div>
    `;
  });
  
  dayMedicationsContainer.innerHTML = medicinesHTML;
}

// Render list of all medicines
function renderMedicineList() {
  const medicineListContainer = document.getElementById('medicine-full-list');
  if (!medicineListContainer) return;
  
  const medicines = getMedicines();
  
  if (medicines.length === 0) {
    medicineListContainer.innerHTML = '<p class="no-medicines">No medications added yet.</p>';
    return;
  }
  
  let medicinesHTML = '';
  
  medicines.forEach(med => {
    medicinesHTML += `
      <div class="medicine-item" data-id="${med.id}">
        <img src="public/lovable-uploads/e55297b4-0990-479a-a0ad-003f2b59588c.png" alt="Pill" class="medication-pill-icon">
        <div class="medicine-item-info">
          <h3>${med.name}</h3>
          <div class="medicine-details">
            <div><i class="fas fa-clock"></i> <span>${med.times.join(', ')} ${med.frequency}</span></div>
            <div><i class="fas fa-pills"></i> <span>${med.dosage}</span></div>
            ${med.notes ? `<div><i class="fas fa-sticky-note"></i> <span>${med.notes}</span></div>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  medicineListContainer.innerHTML = medicinesHTML;
  
  // Add event listeners to medicine items
  document.querySelectorAll('.medicine-item').forEach(item => {
    item.addEventListener('click', function() {
      const medicineId = this.getAttribute('data-id');
      openMedicineDetail(medicineId);
    });
  });
}

// Render today's medicines
function renderTodayMedicines() {
  const todayListContainer = document.getElementById('today-list');
  if (!todayListContainer) return;
  
  const today = new Date();
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()];
  const medicines = getMedicines();
  
  // Filter medicines for today
  const todayMedicines = medicines.filter(med => med.days.includes(dayOfWeek));
  
  if (todayMedicines.length === 0) {
    todayListContainer.innerHTML = '<p class="no-medicines">No medications scheduled for today.</p>';
    return;
  }
  
  let medicinesHTML = '';
  
  todayMedicines.forEach(med => {
    medicinesHTML += `
      <div class="medication-item">
        <img src="public/lovable-uploads/e55297b4-0990-479a-a0ad-003f2b59588c.png" alt="Pill" class="medication-pill-icon">
        <div class="medicine-info">
          <h3>${med.name}</h3>
          <p>${med.dosage}</p>
          <p>${med.times.join(', ')}</p>
        </div>
      </div>
    `;
  });
  
  todayListContainer.innerHTML = medicinesHTML;
}

// Open medicine detail
function openMedicineDetail(medicineId) {
  const medicines = getMedicines();
  const medicine = medicines.find(med => med.id === medicineId);
  
  if (!medicine) return;
  
  const detailModal = document.getElementById('medicine-detail-modal');
  const detailContent = document.getElementById('medicine-detail-content');
  
  detailContent.innerHTML = `
    <h2>${medicine.name}</h2>
    <div class="medicine-details">
      <div><i class="fas fa-pills"></i> <span>${medicine.dosage}</span></div>
      <div><i class="fas fa-clock"></i> <span>${medicine.times.join(', ')} (${medicine.frequency})</span></div>
      <div><i class="fas fa-calendar-alt"></i> <span>${medicine.days.map(day => day.toUpperCase()).join(', ')}</span></div>
      <div><i class="fas fa-hourglass-end"></i> <span>${medicine.duration}</span></div>
      ${medicine.notes ? `<div><i class="fas fa-sticky-note"></i> <span>${medicine.notes}</span></div>` : ''}
    </div>
  `;
  
  // Show the modal
  detailModal.style.display = 'flex';
  
  // Close modal when clicking X
  document.querySelector('.close-btn').addEventListener('click', function() {
    detailModal.style.display = 'none';
  });
  
  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target === detailModal) {
      detailModal.style.display = 'none';
    }
  });
  
  // Set up edit button
  document.getElementById('edit-medicine').addEventListener('click', function() {
    // Here you would implement edit functionality
    // For now, just store the ID in localStorage and redirect to form
    localStorage.setItem('editMedicineId', medicineId);
    window.location.href = 'medicine-form.html';
  });
  
  // Set up delete button
  document.getElementById('delete-medicine').addEventListener('click', function() {
    const confirmationModal = document.getElementById('confirmation-modal');
    detailModal.style.display = 'none';
    confirmationModal.style.display = 'flex';
    
    // Set up cancel button
    document.getElementById('cancel-delete').addEventListener('click', function() {
      confirmationModal.style.display = 'none';
    });
    
    // Set up confirm button
    document.getElementById('confirm-delete').addEventListener('click', function() {
      deleteMedicine(medicineId);
      confirmationModal.style.display = 'none';
      showToast('Medicine deleted successfully!');
      renderMedicineList();
    });
  });
}

// Delete medicine
function deleteMedicine(medicineId) {
  let medicines = getMedicines();
  medicines = medicines.filter(med => med.id !== medicineId);
  localStorage.setItem('medicines', JSON.stringify(medicines));
}

// Add these CSS rules to the styles.css file for the calendar
document.addEventListener('DOMContentLoaded', function() {
  const styleSheet = document.styleSheets[0];
  
  const calendarStyles = `
  .calendar-container {
    margin-bottom: 20px;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .calendar-nav-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1.2rem;
    cursor: pointer;
  }
  
  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
  }
  
  .weekday {
    text-align: center;
    font-weight: 500;
    color: var(--medium-gray);
    padding: 5px;
  }
  
  .calendar-day {
    text-align: center;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .calendar-day.empty {
    cursor: default;
  }
  
  .calendar-day.today {
    background-color: var(--primary-color);
    color: white;
  }
  
  .calendar-day.selected {
    background-color: var(--primary-light);
    color: var(--primary-color);
  }
  
  .no-medicines {
    text-align: center;
    color: var(--medium-gray);
    padding: 20px;
  }
  
  .profile-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-card {
    background-color: var(--white);
    border-radius: var(--border-radius);
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: var(--shadow);
  }
  
  .profile-picture {
    font-size: 5rem;
    color: var(--primary-color);
    margin-bottom: 10px;
  }
  
  .profile-menu {
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  
  .profile-menu-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid var(--light-gray);
  }
  
  .profile-menu-item:last-child {
    border-bottom: none;
  }
  
  .profile-menu-item i:first-child {
    margin-right: 15px;
    color: var(--primary-color);
    width: 20px;
    text-align: center;
  }
  
  .profile-menu-item span {
    flex: 1;
  }
  
  .medication-checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid var(--medium-gray);
    border-radius: 5px;
  }
  `;
  
  try {
    styleSheet.insertRule(calendarStyles, styleSheet.cssRules.length);
  } catch (e) {
    // If inserting multiple rules at once doesn't work, split them up
    calendarStyles.split('}').forEach(rule => {
      if (rule.trim().length) {
        try {
          styleSheet.insertRule(rule + '}', styleSheet.cssRules.length);
        } catch (e) {
          console.log('Could not insert CSS rule: ', rule);
        }
      }
    });
  }
});
