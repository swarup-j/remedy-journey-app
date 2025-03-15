
// Import utilities and API
import { showToast, setupOfflineDetection, requireAuth } from './utils.js';
import api from '../api.js';

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if not authenticated
  if (!requireAuth()) {
    return;
  }
  
  // Setup offline detection
  setupOfflineDetection();
  
  // Initialize the form
  initializeMedicineForm();
});

// Initialize Medicine Form
function initializeMedicineForm() {
  // Get form elements
  const form = document.getElementById('medicine-details-form');
  const colorOptions = document.querySelectorAll('.color-option');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const addTimingButton = document.getElementById('add-timing');
  const timingContainer = document.getElementById('timing-container');
  
  // Set today's date as the minimum start date
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  
  // Start date change event
  startDateInput.addEventListener('change', function() {
    // Update min date of end date to be at least start date
    endDateInput.min = this.value;
    
    // If end date is before start date, clear end date
    if (endDateInput.value && endDateInput.value < this.value) {
      endDateInput.value = '';
      showAlert('Date Range Error', 'End date cannot be before start date. Please select a valid end date.');
    }
  });
  
  // End date change event
  endDateInput.addEventListener('change', function() {
    if (this.value && startDateInput.value && this.value < startDateInput.value) {
      this.value = '';
      showAlert('Date Range Error', 'End date cannot be before start date. Please select a valid end date.');
    }
  });
  
  // Color selection
  colorOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove active class from all options
      colorOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to selected option
      this.classList.add('active');
      
      // Update hidden input with selected color
      document.getElementById('selected-color').value = this.dataset.color;
    });
  });
  
  // Add timing button
  addTimingButton.addEventListener('click', function() {
    addTimingField();
  });
  
  // Initial timing field setup - remove button functionality
  setupRemoveTimingButtons();
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (validateForm()) {
      saveMedicine();
    }
  });
}

// Add a new timing field
function addTimingField() {
  const timingContainer = document.getElementById('timing-container');
  
  const timingEntry = document.createElement('div');
  timingEntry.className = 'timing-entry';
  
  timingEntry.innerHTML = `
    <input type="time" class="time-input" required>
    <button type="button" class="remove-timing"><i class="fas fa-times"></i></button>
  `;
  
  timingContainer.appendChild(timingEntry);
  
  // Setup remove button for the new timing field
  setupRemoveTimingButtons();
}

// Setup remove timing buttons
function setupRemoveTimingButtons() {
  const removeButtons = document.querySelectorAll('.remove-timing');
  
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Don't remove if it's the only timing field
      const timingFields = document.querySelectorAll('.timing-entry');
      if (timingFields.length > 1) {
        this.parentElement.remove();
      } else {
        showToast('At least one timing is required');
      }
    });
  });
}

// Validate the form
function validateForm() {
  // Check medicine name
  const medicineName = document.getElementById('medicine-name').value.trim();
  if (!medicineName) {
    showAlert('Missing Information', 'Please enter the medicine name.');
    return false;
  }
  
  // Check medicine type
  const medicineType = document.getElementById('medicine-type').value;
  if (!medicineType) {
    showAlert('Missing Information', 'Please select the medicine type.');
    return false;
  }
  
  // Check color selection
  const selectedColor = document.getElementById('selected-color').value;
  if (!selectedColor) {
    showAlert('Missing Information', 'Please select a color for the medicine.');
    return false;
  }
  
  // Check dates
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  
  if (!startDate) {
    showAlert('Missing Information', 'Please select a start date.');
    return false;
  }
  
  if (!endDate) {
    showAlert('Missing Information', 'Please select an end date.');
    return false;
  }
  
  if (new Date(endDate) < new Date(startDate)) {
    showAlert('Date Range Error', 'End date cannot be before start date.');
    return false;
  }
  
  // Check timing selections
  const timeInputs = document.querySelectorAll('.time-input');
  let isTimeValid = true;
  
  timeInputs.forEach(input => {
    if (!input.value) {
      isTimeValid = false;
    }
  });
  
  if (!isTimeValid) {
    showAlert('Missing Information', 'Please enter all timing values.');
    return false;
  }
  
  // Check days selection
  const selectedDays = document.querySelectorAll('input[name="days"]:checked');
  if (selectedDays.length === 0) {
    showAlert('Missing Information', 'Please select at least one day of the week.');
    return false;
  }
  
  return true;
}

// Save medicine to the database
async function saveMedicine() {
  // Get all form values
  const medicineName = document.getElementById('medicine-name').value.trim();
  const medicineType = document.getElementById('medicine-type').value;
  const medicineColor = document.getElementById('selected-color').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const notes = document.getElementById('notes').value.trim();
  
  // Get all timing values
  const timeInputs = document.querySelectorAll('.time-input');
  const timeSlots = Array.from(timeInputs).map(input => input.value);
  
  // Get selected days
  const selectedDays = document.querySelectorAll('input[name="days"]:checked');
  const days = Array.from(selectedDays).map(checkbox => checkbox.value);
  
  // Create medicine object
  const medicine = {
    name: medicineName,
    type: medicineType,
    color: medicineColor,
    startDate: startDate,
    endDate: endDate,
    timeSlots: timeSlots,
    days: days,
    notes: notes
  };
  
  try {
    // Save medicine to API
    const result = await api.addMedicine(medicine);
    
    if (result.error) {
      showAlert('Error', `Failed to save medicine: ${result.error}`);
    } else {
      showToast('Medicine saved successfully!');
      
      // Reset form or redirect to medicine list
      setTimeout(() => {
        window.location.href = 'medicine-list.html';
      }, 1500);
    }
  } catch (error) {
    console.error('Error saving medicine:', error);
    showAlert('Error', 'Failed to save medicine. Please try again later.');
  }
}

// Show alert modal
function showAlert(title, message) {
  const modal = document.getElementById('alert-modal');
  const alertTitle = document.getElementById('alert-title');
  const alertMessage = document.getElementById('alert-message');
  const closeBtn = document.querySelector('.close-btn');
  const okBtn = document.getElementById('alert-ok');
  
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  
  modal.style.display = 'flex';
  
  // Close modal events
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };
  
  okBtn.onclick = function() {
    modal.style.display = 'none';
  };
  
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}
