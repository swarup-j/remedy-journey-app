
// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Current Date Display
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  // Initialize local storage
  if (!localStorage.getItem('medicines')) {
    localStorage.setItem('medicines', JSON.stringify([]));
  }

  // Get current page
  const currentPage = window.location.pathname.split('/').pop();

  // Handle medicine form submission
  const medicineForm = document.getElementById('medicine-form');
  if (medicineForm) {
    // Frequency change handler
    const frequencySelect = document.getElementById('frequency');
    frequencySelect.addEventListener('change', function() {
      // Add appropriate number of time slots based on frequency
      const timeSlots = document.getElementById('time-slots');
      const timeInputs = timeSlots.querySelectorAll('.time-slot');
      
      // Remove all time slots except the first one
      for (let i = timeInputs.length - 1; i > 0; i--) {
        timeInputs[i].remove();
      }
      
      // Reset first time slot
      const firstTimeSlot = timeInputs[0];
      firstTimeSlot.querySelector('input').value = '';
      
      // Add time slots based on selection
      if (this.value === 'twice') {
        addTimeSlot();
      } else if (this.value === 'three') {
        addTimeSlot();
        addTimeSlot();
      }
    });
    
    // Add time slot button
    const addTimeSlotBtn = document.getElementById('add-time-slot');
    addTimeSlotBtn.addEventListener('click', addTimeSlot);
    
    // Form submission
    medicineForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const medicineName = document.getElementById('medicine-name').value;
      const dosage = document.getElementById('dosage').value;
      const frequency = document.getElementById('frequency').value;
      const notes = document.getElementById('notes').value;
      const duration = document.getElementById('duration').value;
      
      // Get time slots
      const timeSlots = [];
      const timeInputs = document.querySelectorAll('.time-input');
      timeInputs.forEach(input => {
        if (input.value) {
          timeSlots.push(input.value);
        }
      });
      
      // Get selected days
      const days = [];
      const dayCheckboxes = document.querySelectorAll('.day input[type="checkbox"]');
      dayCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
          days.push(checkbox.value);
        }
      });
      
      // Create medicine object
      const medicine = {
        id: Date.now().toString(),
        name: medicineName,
        dosage: dosage,
        frequency: frequency,
        timeSlots: timeSlots,
        days: days,
        duration: duration,
        notes: notes,
        created: new Date().toISOString()
      };
      
      // Save to local storage
      const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
      medicines.push(medicine);
      localStorage.setItem('medicines', JSON.stringify(medicines));
      
      // Show toast notification
      showToast('Medicine added successfully');
      
      // Redirect back to home page
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // Handle medicine list page
  if (currentPage === 'medicine-list.html') {
    renderMedicineList();
    
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
        renderMedicineList(); // Reset search
      });
      
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        renderMedicineList(searchTerm);
      });
    }
    
    // Medicine detail modal
    const detailModal = document.getElementById('medicine-detail-modal');
    const closeDetailBtn = detailModal.querySelector('.close-btn');
    const editMedicineBtn = document.getElementById('edit-medicine');
    const deleteMedicineBtn = document.getElementById('delete-medicine');
    
    closeDetailBtn.addEventListener('click', function() {
      detailModal.style.display = 'none';
    });
    
    editMedicineBtn.addEventListener('click', function() {
      const medicineId = this.dataset.id;
      window.location.href = `medicine-form.html?id=${medicineId}`;
    });
    
    deleteMedicineBtn.addEventListener('click', function() {
      const medicineId = this.dataset.id;
      openConfirmationModal(medicineId);
    });
  }

  // Handle home page
  if (currentPage === 'index.html' || currentPage === '') {
    renderTodayMedicines();
    
    // Add event listeners for take buttons
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('take-btn')) {
        const medicineId = e.target.dataset.id;
        const timeSlot = e.target.dataset.time;
        
        // Mark medicine as taken
        markMedicineAsTaken(medicineId, timeSlot);
        
        // Show toast
        showToast('Medicine marked as taken');
        
        // Update UI
        e.target.textContent = 'Taken';
        e.target.classList.add('taken');
        e.target.disabled = true;
      }
    });

    // Reminder modal
    const reminderBtn = document.getElementById('notifications-btn');
    const reminderModal = document.getElementById('reminder-modal');
    const closeReminderBtn = reminderModal.querySelector('.close-btn');
    const reminderForm = document.getElementById('reminder-form');
    
    if (reminderBtn && reminderModal && closeReminderBtn && reminderForm) {
      reminderBtn.addEventListener('click', function() {
        reminderModal.style.display = 'flex';
      });
      
      closeReminderBtn.addEventListener('click', function() {
        reminderModal.style.display = 'none';
      });
      
      reminderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reminderTime = document.getElementById('reminder-time').value;
        
        // Get selected days
        const days = [];
        const dayCheckboxes = document.querySelectorAll('#reminder-modal .day input[type="checkbox"]');
        dayCheckboxes.forEach(checkbox => {
          if (checkbox.checked) {
            days.push(checkbox.value);
          }
        });
        
        // Save reminder
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders.push({
          id: Date.now().toString(),
          time: reminderTime,
          days: days
        });
        localStorage.setItem('reminders', JSON.stringify(reminders));
        
        // Show toast
        showToast('Reminder set successfully');
        
        // Close modal
        reminderModal.style.display = 'none';
      });
    }
  }

  // Modal window close on outside click
  window.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Confirmation modal for deleting medicine
  const confirmationModal = document.getElementById('confirmation-modal');
  if (confirmationModal) {
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    cancelDeleteBtn.addEventListener('click', function() {
      confirmationModal.style.display = 'none';
    });
    
    confirmDeleteBtn.addEventListener('click', function() {
      const medicineId = this.dataset.id;
      deleteMedicine(medicineId);
      confirmationModal.style.display = 'none';
      document.getElementById('medicine-detail-modal').style.display = 'none';
      renderMedicineList();
      showToast('Medicine deleted successfully');
    });
  }
});

// Helper Functions

// Add time slot
function addTimeSlot() {
  const timeSlots = document.getElementById('time-slots');
  const timeSlotTemplate = document.querySelector('.time-slot').cloneNode(true);
  
  // Reset values
  timeSlotTemplate.querySelector('input').value = '';
  
  // Show remove button
  const removeBtn = timeSlotTemplate.querySelector('.remove-time');
  removeBtn.classList.remove('hidden');
  removeBtn.addEventListener('click', function() {
    this.parentElement.remove();
  });
  
  // Add to container
  timeSlots.appendChild(timeSlotTemplate);
}

// Render medicine list
function renderMedicineList(searchTerm = '') {
  const medicineListEl = document.getElementById('medicine-full-list');
  if (!medicineListEl) return;
  
  // Clear list
  medicineListEl.innerHTML = '';
  
  // Get medicines from local storage
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  
  // Filter by search term if provided
  const filteredMedicines = searchTerm ? 
    medicines.filter(med => med.name.toLowerCase().includes(searchTerm)) : 
    medicines;
  
  if (filteredMedicines.length === 0) {
    medicineListEl.innerHTML = `
      <div class="empty-state">
        <p>${searchTerm ? 'No medicines found matching your search.' : 'No medicines added yet.'}</p>
        ${!searchTerm ? '<p>Click the + button to add your first medicine.</p>' : ''}
      </div>
    `;
    return;
  }
  
  // Sort by name
  filteredMedicines.sort((a, b) => a.name.localeCompare(b.name));
  
  // Render each medicine
  filteredMedicines.forEach(medicine => {
    const medicineEl = document.createElement('div');
    medicineEl.className = 'medicine-item';
    medicineEl.innerHTML = `
      <div class="pill-icon"><i class="fas fa-pills"></i></div>
      <div class="medicine-item-info">
        <h3>${medicine.name}</h3>
        <p>${medicine.dosage} - ${formatFrequency(medicine.frequency)}</p>
      </div>
      <button class="icon-btn view-details" data-id="${medicine.id}">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    // Add click event for viewing details
    medicineEl.querySelector('.view-details').addEventListener('click', function() {
      openMedicineDetails(medicine.id);
    });
    
    medicineListEl.appendChild(medicineEl);
  });
}

// Open medicine details modal
function openMedicineDetails(medicineId) {
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  const medicine = medicines.find(med => med.id === medicineId);
  
  if (!medicine) return;
  
  const detailContent = document.getElementById('medicine-detail-content');
  detailContent.innerHTML = `
    <h2>${medicine.name}</h2>
    <div class="medicine-details">
      <div>
        <i class="fas fa-prescription-bottle"></i>
        <span>${medicine.dosage}</span>
      </div>
      <div>
        <i class="fas fa-clock"></i>
        <span>${formatFrequency(medicine.frequency)}</span>
      </div>
      <div>
        <i class="fas fa-calendar-alt"></i>
        <span>${formatDays(medicine.days)}</span>
      </div>
      ${medicine.timeSlots.length > 0 ? `
        <div>
          <i class="fas fa-hourglass"></i>
          <span>${medicine.timeSlots.map(formatTime).join(', ')}</span>
        </div>
      ` : ''}
      ${medicine.notes ? `
        <div>
          <i class="fas fa-sticky-note"></i>
          <span>${medicine.notes}</span>
        </div>
      ` : ''}
    </div>
  `;
  
  // Set medicine ID for edit and delete buttons
  document.getElementById('edit-medicine').dataset.id = medicineId;
  document.getElementById('delete-medicine').dataset.id = medicineId;
  
  // Show modal
  document.getElementById('medicine-detail-modal').style.display = 'flex';
}

// Open confirmation modal for deleting medicine
function openConfirmationModal(medicineId) {
  const confirmDeleteBtn = document.getElementById('confirm-delete');
  confirmDeleteBtn.dataset.id = medicineId;
  document.getElementById('confirmation-modal').style.display = 'flex';
}

// Delete medicine
function deleteMedicine(medicineId) {
  let medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  medicines = medicines.filter(med => med.id !== medicineId);
  localStorage.setItem('medicines', JSON.stringify(medicines));
}

// Render today's medicines
function renderTodayMedicines() {
  const todayListEl = document.getElementById('today-list');
  if (!todayListEl) return;
  
  // Get medicines from local storage
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  
  // Get today's day of week
  const today = new Date();
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()];
  
  // Filter medicines for today
  const todayMedicines = medicines.filter(med => med.days.includes(dayOfWeek));
  
  if (todayMedicines.length === 0) {
    todayListEl.innerHTML = `
      <div class="empty-state">
        <p>No medications scheduled for today.</p>
      </div>
    `;
    return;
  }
  
  // Group medicines by time slot
  const medicinesByTime = {};
  
  todayMedicines.forEach(med => {
    med.timeSlots.forEach(time => {
      if (!medicinesByTime[time]) {
        medicinesByTime[time] = [];
      }
      medicinesByTime[time].push(med);
    });
  });
  
  // Sort times
  const sortedTimes = Object.keys(medicinesByTime).sort();
  
  // Clear timeline
  const timelineEl = document.querySelector('.timeline');
  if (timelineEl) {
    timelineEl.innerHTML = '';
    
    // Render each time slot
    sortedTimes.forEach(time => {
      const timeSlotEl = document.createElement('div');
      timeSlotEl.className = 'timeline-item';
      
      const timeEl = document.createElement('div');
      timeEl.className = 'time';
      timeEl.textContent = formatTime(time);
      
      const medicineCardsEl = document.createElement('div');
      medicineCardsEl.className = 'medicine-cards';
      
      // Add each medicine for this time
      medicinesByTime[time].forEach(med => {
        const isTaken = checkIfTaken(med.id, time);
        
        const medicineCardEl = document.createElement('div');
        medicineCardEl.className = 'medicine-card';
        medicineCardEl.innerHTML = `
          <div class="pill-icon"><i class="fas fa-pills"></i></div>
          <div class="medicine-info">
            <h3>${med.name}</h3>
            <p>${med.dosage}</p>
          </div>
          <button class="take-btn ${isTaken ? 'taken' : ''}" 
                  data-id="${med.id}" 
                  data-time="${time}"
                  ${isTaken ? 'disabled' : ''}>
            ${isTaken ? 'Taken' : 'Take'}
          </button>
        `;
        
        medicineCardsEl.appendChild(medicineCardEl);
      });
      
      timeSlotEl.appendChild(timeEl);
      timeSlotEl.appendChild(medicineCardsEl);
      timelineEl.appendChild(timeSlotEl);
    });
  }
}

// Mark medicine as taken
function markMedicineAsTaken(medicineId, timeSlot) {
  const taken = JSON.parse(localStorage.getItem('taken') || '{}');
  const today = new Date().toDateString();
  
  if (!taken[today]) {
    taken[today] = {};
  }
  
  if (!taken[today][medicineId]) {
    taken[today][medicineId] = [];
  }
  
  taken[today][medicineId].push(timeSlot);
  localStorage.setItem('taken', JSON.stringify(taken));
}

// Check if medicine is taken
function checkIfTaken(medicineId, timeSlot) {
  const taken = JSON.parse(localStorage.getItem('taken') || '{}');
  const today = new Date().toDateString();
  
  if (!taken[today] || !taken[today][medicineId]) {
    return false;
  }
  
  return taken[today][medicineId].includes(timeSlot);
}

// Format frequency
function formatFrequency(frequency) {
  switch (frequency) {
    case 'once':
      return 'Once a day';
    case 'twice':
      return 'Twice a day';
    case 'three':
      return 'Three times a day';
    case 'custom':
      return 'Custom schedule';
    default:
      return frequency;
  }
}

// Format days
function formatDays(days) {
  if (days.length === 7) {
    return 'Every day';
  }
  
  const dayMap = {
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday'
  };
  
  return days.map(day => dayMap[day]).join(', ');
}

// Format time
function formatTime(time24) {
  const [hours, minutes] = time24.split(':');
  let period = 'AM';
  let hour = parseInt(hours);
  
  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) {
      hour -= 12;
    }
  }
  
  if (hour === 0) {
    hour = 12;
  }
  
  return `${hour}:${minutes} ${period}`;
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.style.display = 'flex';
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}
