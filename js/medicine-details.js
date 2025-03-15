
// Medicine Details Form Functionality
import api from '../api.js';
import { showToast, checkOnlineStatus, setupOfflineDetection, requireAuth } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Require authentication for this page
  if (!requireAuth()) {
    return;
  }

  // Initialize the medicine form
  initializeMedicineForm();
});

function initializeMedicineForm() {
  // Color selection logic
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Clear all selected colors
      colorOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Select the clicked color
      this.classList.add('selected');
      
      // Check the radio input
      const radioInput = this.querySelector('input[type="radio"]');
      radioInput.checked = true;
    });
  });

  // Date validation logic
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  
  // Set start date to today by default
  startDateInput.valueAsDate = new Date();
  
  endDateInput.addEventListener('change', function() {
    if (this.value && startDateInput.value && this.value < startDateInput.value) {
      alert('End date cannot be before start date!');
      this.value = '';
    }
  });
  
  // Time slots logic
  const addTimeButton = document.getElementById('add-time');
  const timeSlotsContainer = document.getElementById('time-slots');
  
  addTimeButton.addEventListener('click', function() {
    addTimeSlot();
  });
  
  // Handle removing time slots
  timeSlotsContainer.addEventListener('click', function(event) {
    if (event.target.closest('.remove-time')) {
      const timeSlot = event.target.closest('.time-slot');
      
      // Only remove if there's more than one time slot
      if (timeSlotsContainer.children.length > 1) {
        timeSlot.remove();
      }
    }
  });
  
  // Frequency change handler
  const frequencySelect = document.getElementById('frequency');
  frequencySelect.addEventListener('change', function() {
    const value = this.value;
    
    // Clear existing time slots
    timeSlotsContainer.innerHTML = '';
    
    // Add appropriate number of time slots based on frequency
    if (value === 'once') {
      addTimeSlot('08:00');
    } else if (value === 'twice') {
      addTimeSlot('08:00');
      addTimeSlot('20:00');
    } else if (value === 'thrice') {
      addTimeSlot('08:00');
      addTimeSlot('14:00');
      addTimeSlot('20:00');
    } else if (value === 'custom') {
      addTimeSlot('');
    }
    
    // Show or hide the "Add Time Slot" button based on frequency
    addTimeButton.style.display = value === 'custom' ? 'block' : 'none';
  });
  
  // Form submission handler
  const form = document.getElementById('medicine-form');
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Get form data
      const medicineData = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        color: document.querySelector('input[name="color"]:checked')?.value || '',
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        frequency: document.getElementById('frequency').value,
        timeSlots: Array.from(document.querySelectorAll('.time-input')).map(input => input.value),
        days: Array.from(document.querySelectorAll('input[name="day"]:checked')).map(input => input.value),
        notes: document.getElementById('notes').value
      };
      
      // Check online status
      const online = await checkOnlineStatus();
      
      // Allow saving in demo mode even when offline
      if (!online && !api.isDemoMode()) {
        showToast('Cannot save while offline. Please check your internet connection.');
        return;
      }
      
      // Call API to add medicine
      const result = await api.addMedicine(medicineData);
      
      if (result.error) {
        showToast(`Error: ${result.error}`);
      } else {
        showToast('Medicine added successfully!');
        
        // Reset form or redirect
        setTimeout(() => {
          window.location.href = 'medicine-list.html';
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving medicine:', error);
      showToast('Error saving medicine. Please try again.');
    }
  });
  
  // Set up default values for a new medicine
  setDefaultValues();
}

function setDefaultValues() {
  // Default to once daily frequency
  document.getElementById('frequency').value = 'once';
  
  // Add default time slot
  const timeSlotsContainer = document.getElementById('time-slots');
  timeSlotsContainer.innerHTML = '';
  addTimeSlot('08:00');
  
  // Hide add time button initially (since default is once daily)
  document.getElementById('add-time').style.display = 'none';
}

function addTimeSlot(defaultTime = '') {
  const timeSlotsContainer = document.getElementById('time-slots');
  const timeSlot = document.createElement('div');
  timeSlot.className = 'time-slot';
  
  const timeInput = document.createElement('input');
  timeInput.type = 'time';
  timeInput.className = 'time-input';
  timeInput.name = 'time-slot';
  timeInput.required = true;
  if (defaultTime) {
    timeInput.value = defaultTime;
  }
  
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove-time';
  removeButton.innerHTML = '<i class="fas fa-times"></i>';
  
  // Only show remove button if there's more than one time slot
  if (timeSlotsContainer.children.length > 0) {
    removeButton.classList.remove('hidden');
    
    // Also unhide remove buttons in any existing time slots
    const existingRemoveButtons = timeSlotsContainer.querySelectorAll('.remove-time');
    existingRemoveButtons.forEach(button => button.classList.remove('hidden'));
  }
  
  timeSlot.appendChild(timeInput);
  timeSlot.appendChild(removeButton);
  timeSlotsContainer.appendChild(timeSlot);
}

function validateForm() {
  // Check all required fields
  const requiredFields = [
    { id: 'name', message: 'Please enter the medicine name' },
    { id: 'type', message: 'Please select the medicine type' },
    { id: 'start-date', message: 'Please select a start date' },
  ];
  
  for (const field of requiredFields) {
    const element = document.getElementById(field.id);
    if (!element.value) {
      showToast(field.message);
      element.focus();
      return false;
    }
  }
  
  // Check if a color is selected
  const colorSelected = document.querySelector('input[name="color"]:checked');
  if (!colorSelected) {
    showToast('Please select a medicine color');
    return false;
  }
  
  // Check if at least one day is selected
  const daysSelected = document.querySelectorAll('input[name="day"]:checked');
  if (daysSelected.length === 0) {
    showToast('Please select at least one day of the week');
    return false;
  }
  
  // Check if time slots are filled
  const timeInputs = document.querySelectorAll('.time-input');
  for (const input of timeInputs) {
    if (!input.value) {
      showToast('Please fill in all time slots');
      input.focus();
      return false;
    }
  }
  
  return true;
}
