
// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Current Date Display
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  // Set greeting based on time of day
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = 'Good morning!';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon!';
    } else if (hour >= 18) {
      greeting = 'Good evening!';
    }
    
    greetingEl.textContent = greeting;
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
    // Check if editing an existing medicine
    const urlParams = new URLSearchParams(window.location.search);
    const medicineId = urlParams.get('id');
    
    if (medicineId) {
      // Update form title
      const formTitle = document.getElementById('form-title');
      if (formTitle) {
        formTitle.textContent = 'Edit Medicine';
      }
      
      // Populate form with medicine data
      populateMedicineForm(medicineId);
    }
    
    // Medicine type change handler
    const medicineTypeSelect = document.getElementById('medicine-type');
    if (medicineTypeSelect) {
      medicineTypeSelect.addEventListener('change', function() {
        updatePillIcon(this.value);
      });
    }
    
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
      const medicineType = document.getElementById('medicine-type').value;
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
        id: medicineId || Date.now().toString(),
        name: medicineName,
        type: medicineType || 'tablet',
        dosage: dosage,
        frequency: frequency,
        timeSlots: timeSlots,
        days: days,
        duration: duration,
        notes: notes,
        created: medicineId ? getMedicineCreatedDate(medicineId) : new Date().toISOString()
      };
      
      // Save to local storage
      saveMedicine(medicine, !!medicineId);
      
      // Show toast notification
      showToast(medicineId ? 'Medicine updated successfully' : 'Medicine added successfully');
      
      // Redirect back to medicine list page
      setTimeout(() => {
        window.location.href = 'medicine-list.html';
      }, 1500);
    });
  }

  // Handle medicine list page
  if (currentPage === 'medicine-list.html') {
    renderMedicineList();
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          // Remove active class from all buttons
          filterBtns.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          this.classList.add('active');
          // Apply filter
          const filter = this.dataset.filter;
          renderMedicineList(null, filter);
        });
      });
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
        renderMedicineList(); // Reset search
      });
      
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderMedicineList(searchTerm, activeFilter);
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
  }

  // Handle calendar page
  if (currentPage === 'calendar.html') {
    // Initialize calendar
    initCalendar();
    
    // Calendar navigation
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (prevMonthBtn && nextMonthBtn) {
      prevMonthBtn.addEventListener('click', function() {
        changeMonth(-1);
      });
      
      nextMonthBtn.addEventListener('click', function() {
        changeMonth(1);
      });
    }
  }

  // Handle profile page
  if (currentPage === 'profile.html') {
    // Load profile stats
    updateProfileStats();
    
    // Add click events to settings sections
    const profileSections = document.querySelectorAll('.profile-section');
    profileSections.forEach(section => {
      section.addEventListener('click', function() {
        // This would normally navigate to the specific settings page
        // For now, just show a toast
        showToast('This feature will be available soon');
      });
    });
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        // This would normally handle logout logic
        showToast('Logged out successfully');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
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

// Update pill icon based on medicine type
function updatePillIcon(type) {
  // This would normally update the pill icon based on medicine type
  // But it's not implemented in the current UI
}

// Populate medicine form with existing data
function populateMedicineForm(medicineId) {
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  const medicine = medicines.find(med => med.id === medicineId);
  
  if (!medicine) return;
  
  // Set form values
  document.getElementById('medicine-name').value = medicine.name;
  if (medicine.type && document.getElementById('medicine-type')) {
    document.getElementById('medicine-type').value = medicine.type;
  }
  document.getElementById('dosage').value = medicine.dosage;
  document.getElementById('frequency').value = medicine.frequency;
  document.getElementById('notes').value = medicine.notes || '';
  document.getElementById('duration').value = medicine.duration;
  
  // Set days
  const dayCheckboxes = document.querySelectorAll('.day input[type="checkbox"]');
  dayCheckboxes.forEach(checkbox => {
    checkbox.checked = medicine.days.includes(checkbox.value);
  });
  
  // Set time slots
  const timeSlots = document.getElementById('time-slots');
  // Clear existing time slots
  timeSlots.innerHTML = '';
  
  // Add time slots
  medicine.timeSlots.forEach((time, index) => {
    const timeSlot = document.createElement('div');
    timeSlot.className = 'time-slot';
    timeSlot.innerHTML = `
      <input type="time" class="time-input" value="${time}" required>
      ${index > 0 ? '<button type="button" class="remove-time"><i class="fas fa-times"></i></button>' : '<button type="button" class="remove-time hidden"><i class="fas fa-times"></i></button>'}
    `;
    
    // Add remove event for non-first slots
    if (index > 0) {
      timeSlot.querySelector('.remove-time').addEventListener('click', function() {
        this.parentElement.remove();
      });
    }
    
    timeSlots.appendChild(timeSlot);
  });
}

// Get medicine created date
function getMedicineCreatedDate(medicineId) {
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  const medicine = medicines.find(med => med.id === medicineId);
  return medicine ? medicine.created : new Date().toISOString();
}

// Save medicine to local storage
function saveMedicine(medicine, isUpdate) {
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  
  if (isUpdate) {
    // Update existing medicine
    const index = medicines.findIndex(med => med.id === medicine.id);
    if (index !== -1) {
      medicines[index] = medicine;
    }
  } else {
    // Add new medicine
    medicines.push(medicine);
  }
  
  localStorage.setItem('medicines', JSON.stringify(medicines));
}

// Render medicine list
function renderMedicineList(searchTerm = '', filter = 'all') {
  const medicineListEl = document.getElementById('medicine-full-list');
  if (!medicineListEl) return;
  
  // Clear list
  medicineListEl.innerHTML = '';
  
  // Get medicines from local storage
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  
  // Apply filter
  let filteredMedicines = medicines;
  
  if (filter === 'daily') {
    filteredMedicines = medicines.filter(med => med.days.length === 7);
  } else if (filter === 'weekly') {
    filteredMedicines = medicines.filter(med => med.days.length > 0 && med.days.length < 7);
  } else if (filter === 'other') {
    filteredMedicines = medicines.filter(med => med.days.length === 0);
  }
  
  // Apply search filter if provided
  if (searchTerm) {
    filteredMedicines = filteredMedicines.filter(med => 
      med.name.toLowerCase().includes(searchTerm) ||
      med.dosage.toLowerCase().includes(searchTerm)
    );
  }
  
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
    
    // Determine icon based on medicine type
    let iconClass = 'fa-pills';
    if (medicine.type === 'capsule') iconClass = 'fa-capsules';
    else if (medicine.type === 'liquid') iconClass = 'fa-prescription-bottle';
    else if (medicine.type === 'injection') iconClass = 'fa-syringe';
    
    medicineEl.innerHTML = `
      <div class="pill-icon"><i class="fas ${iconClass}"></i></div>
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
  
  // Determine icon based on medicine type
  let iconClass = 'fa-pills';
  if (medicine.type === 'capsule') iconClass = 'fa-capsules';
  else if (medicine.type === 'liquid') iconClass = 'fa-prescription-bottle';
  else if (medicine.type === 'injection') iconClass = 'fa-syringe';
  
  detailContent.innerHTML = `
    <div class="medicine-detail-header">
      <div class="pill-icon"><i class="fas ${iconClass}"></i></div>
      <h2>${medicine.name}</h2>
    </div>
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
      ${medicine.duration ? `
        <div>
          <i class="fas fa-calendar-day"></i>
          <span>${formatDuration(medicine.duration)}</span>
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
        <p>Add medicines to get started.</p>
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
        
        // Determine icon based on medicine type
        let iconClass = 'fa-pills';
        if (med.type === 'capsule') iconClass = 'fa-capsules';
        else if (med.type === 'liquid') iconClass = 'fa-prescription-bottle';
        else if (med.type === 'injection') iconClass = 'fa-syringe';
        
        const medicineCardEl = document.createElement('div');
        medicineCardEl.className = 'medicine-card';
        medicineCardEl.innerHTML = `
          <div class="pill-icon"><i class="fas ${iconClass}"></i></div>
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

// Format duration
function formatDuration(duration) {
  switch (duration) {
    case 'ongoing':
      return 'Ongoing';
    case '1-week':
      return '1 week';
    case '2-weeks':
      return '2 weeks';
    case '1-month':
      return '1 month';
    case 'custom':
      return 'Custom duration';
    default:
      return duration;
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

// Initialize calendar
function initCalendar() {
  const now = new Date();
  renderCalendar(now.getFullYear(), now.getMonth());
}

// Change month
function changeMonth(delta) {
  const monthYear = document.getElementById('calendar-month-year').textContent;
  const [month, year] = monthYear.split(' ');
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let monthIndex = months.indexOf(month);
  let yearNum = parseInt(year);
  
  monthIndex += delta;
  
  if (monthIndex < 0) {
    monthIndex = 11;
    yearNum--;
  } else if (monthIndex > 11) {
    monthIndex = 0;
    yearNum++;
  }
  
  renderCalendar(yearNum, monthIndex);
}

// Render calendar
function renderCalendar(year, month) {
  const calendarDays = document.getElementById('calendar-days');
  const monthYearLabel = document.getElementById('calendar-month-year');
  
  if (!calendarDays || !monthYearLabel) return;
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  monthYearLabel.textContent = `${months[month]} ${year}`;
  
  // Clear calendar
  calendarDays.innerHTML = '';
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get days with medications
  const medsOnDays = getMedicationDays(year, month);
  
  // Get today's date
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();
  
  // Previous month's days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const dayEl = createCalendarDay(day, 'prev-month', false, false);
    calendarDays.appendChild(dayEl);
  }
  
  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = isCurrentMonth && i === todayDate;
    const hasMeds = medsOnDays.includes(i);
    const dayEl = createCalendarDay(i, 'current-month', isToday, hasMeds);
    
    // Add click event
    dayEl.addEventListener('click', function() {
      selectCalendarDay(year, month, i);
    });
    
    calendarDays.appendChild(dayEl);
  }
  
  // Next month's days
  const totalCells = 42; // 6 rows of 7 days
  const remainingCells = totalCells - (firstDay + daysInMonth);
  for (let i = 1; i <= remainingCells; i++) {
    const dayEl = createCalendarDay(i, 'next-month', false, false);
    calendarDays.appendChild(dayEl);
  }
  
  // Select today if it's in the current month
  if (isCurrentMonth) {
    selectCalendarDay(year, month, todayDate);
  } else {
    // Select the first day with medications, or the first day
    const firstMedDay = medsOnDays.length > 0 ? medsOnDays[0] : 1;
    selectCalendarDay(year, month, firstMedDay);
  }
}

// Create calendar day element
function createCalendarDay(day, monthClass, isToday, hasMeds) {
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${monthClass}`;
  dayEl.textContent = day;
  
  if (isToday) {
    dayEl.classList.add('today');
  }
  
  if (hasMeds) {
    dayEl.classList.add('has-meds');
  }
  
  return dayEl;
}

// Get days with medications for a specific month
function getMedicationDays(year, month) {
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result = [];
  
  // For each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
    
    // Check if any medicine is scheduled for this day
    const hasMeds = medicines.some(med => med.days.includes(dayOfWeek));
    
    if (hasMeds) {
      result.push(day);
    }
  }
  
  return result;
}

// Select a day in the calendar
function selectCalendarDay(year, month, day) {
  // Update selected date display
  const selectedDateEl = document.getElementById('selected-date');
  if (selectedDateEl) {
    const date = new Date(year, month, day);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    selectedDateEl.textContent = date.toLocaleDateString('en-US', options);
  }
  
  // Highlight selected day
  const calendarDays = document.querySelectorAll('.calendar-day');
  calendarDays.forEach(dayEl => {
    if (dayEl.classList.contains('selected')) {
      dayEl.classList.remove('selected');
    }
    
    if (dayEl.classList.contains('current-month') && parseInt(dayEl.textContent) === day) {
      dayEl.classList.add('selected');
    }
  });
  
  // Display medications for the selected day
  displayDaySchedule(year, month, day);
}

// Display medications for a specific day
function displayDaySchedule(year, month, day) {
  const scheduleListEl = document.getElementById('schedule-list');
  if (!scheduleListEl) return;
  
  // Clear list
  scheduleListEl.innerHTML = '';
  
  // Get medicines from local storage
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  
  // Get day of week
  const date = new Date(year, month, day);
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
  
  // Filter medicines for this day
  const dayMedicines = medicines.filter(med => med.days.includes(dayOfWeek));
  
  if (dayMedicines.length === 0) {
    scheduleListEl.innerHTML = `
      <div class="empty-state">
        <p>No medications scheduled for this day.</p>
      </div>
    `;
    return;
  }
  
  // Group medicines by time slot
  const medicinesByTime = {};
  
  dayMedicines.forEach(med => {
    med.timeSlots.forEach(time => {
      if (!medicinesByTime[time]) {
        medicinesByTime[time] = [];
      }
      medicinesByTime[time].push(med);
    });
  });
  
  // Sort times
  const sortedTimes = Object.keys(medicinesByTime).sort();
  
  // Render each time slot
  sortedTimes.forEach(time => {
    const timeSlotEl = document.createElement('div');
    timeSlotEl.className = 'schedule-time-slot';
    
    const timeEl = document.createElement('div');
    timeEl.className = 'schedule-time';
    timeEl.textContent = formatTime(time);
    
    const medsEl = document.createElement('div');
    medsEl.className = 'schedule-meds';
    
    // Add each medicine for this time
    medicinesByTime[time].forEach(med => {
      const medEl = document.createElement('div');
      medEl.className = 'schedule-med-item';
      medEl.innerHTML = `
        <span class="med-name">${med.name}</span>
        <span class="med-dose">${med.dosage}</span>
      `;
      medsEl.appendChild(medEl);
    });
    
    timeSlotEl.appendChild(timeEl);
    timeSlotEl.appendChild(medsEl);
    scheduleListEl.appendChild(timeSlotEl);
  });
}

// Update profile statistics
function updateProfileStats() {
  const medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
  
  // Update active medications count
  const activeMedsEl = document.querySelector('.stat-value');
  if (activeMedsEl) {
    activeMedsEl.textContent = medicines.length;
  }
  
  // Calculate adherence rate (this would normally be more complex)
  const taken = JSON.parse(localStorage.getItem('taken') || '{}');
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  // Simple adherence calculation based on last two days
  let scheduled = 0;
  let completed = 0;
  
  // Count today and yesterday's scheduled meds
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
  const yesterdayDayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][yesterday.getDay()];
  
  medicines.forEach(med => {
    if (med.days.includes(dayOfWeek)) {
      scheduled += med.timeSlots.length;
      
      // Count completed
      if (taken[today] && taken[today][med.id]) {
        completed += taken[today][med.id].length;
      }
    }
    
    if (med.days.includes(yesterdayDayOfWeek)) {
      scheduled += med.timeSlots.length;
      
      // Count completed
      if (taken[yesterdayStr] && taken[yesterdayStr][med.id]) {
        completed += taken[yesterdayStr][med.id].length;
      }
    }
  });
  
  // Calculate rate
  let adherenceRate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 100;
  
  // Update UI
  const adherenceRateEl = document.querySelectorAll('.stat-value')[1];
  if (adherenceRateEl) {
    adherenceRateEl.textContent = `${adherenceRate}%`;
  }
}
