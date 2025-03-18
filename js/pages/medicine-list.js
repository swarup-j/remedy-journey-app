
// Medicine list page initialization and functionality
import { fetchMedicines, deleteMedicine } from '../api/medicineApi.js';
import { showToast, setupOfflineDetection } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Initialize medicine list page
  initializeMedicineListPage();
});

async function initializeMedicineListPage() {
  // Set up search functionality
  setupSearch();
  
  // Set up filter buttons
  setupFilters();
  
  // Load medicines
  await loadMedicines();
  
  // Set up modals
  setupModals();
}

// Set up search functionality
function setupSearch() {
  const searchBtn = document.getElementById('search-btn');
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  const closeSearchBtn = document.getElementById('close-search');
  
  if (searchBtn && searchContainer && closeSearchBtn) {
    // Show search
    searchBtn.addEventListener('click', () => {
      searchContainer.classList.remove('hidden');
      searchInput.focus();
    });
    
    // Hide search
    closeSearchBtn.addEventListener('click', () => {
      searchContainer.classList.add('hidden');
      searchInput.value = '';
      // Reset any filtering
      filterMedicines('all');
    });
    
    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }
  }
}

// Handle search input
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const medicineCards = document.querySelectorAll('.medicine-item');
  
  medicineCards.forEach(card => {
    const medicineName = card.querySelector('.medicine-name').textContent.toLowerCase();
    const medicineType = card.querySelector('.medicine-type').textContent.toLowerCase();
    
    if (medicineName.includes(searchTerm) || medicineType.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Set up filter buttons
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Apply filter
      const filter = this.dataset.filter;
      filterMedicines(filter);
    });
  });
}

// Filter medicines
function filterMedicines(filter) {
  const medicineCards = document.querySelectorAll('.medicine-item');
  
  medicineCards.forEach(card => {
    const frequency = card.dataset.frequency;
    
    if (filter === 'all' || filter === frequency) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Load medicines
async function loadMedicines() {
  const medicineListContainer = document.getElementById('medicine-full-list');
  if (!medicineListContainer) return;
  
  medicineListContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
  
  try {
    const medicines = await fetchMedicines();
    
    if (medicines.length === 0) {
      medicineListContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-prescription-bottle-alt"></i>
          <p>No medicines found</p>
          <a href="medicine-form.html" class="primary-button">Add Medicine</a>
        </div>
      `;
      return;
    }
    
    // Sort medicines by name
    medicines.sort((a, b) => a.name.localeCompare(b.name));
    
    medicineListContainer.innerHTML = '';
    
    // Group by first letter
    const groupedMedicines = groupMedicinesByFirstLetter(medicines);
    
    // Create medicine items
    for (const [letter, meds] of Object.entries(groupedMedicines)) {
      const letterHeader = document.createElement('div');
      letterHeader.classList.add('letter-header');
      letterHeader.textContent = letter;
      medicineListContainer.appendChild(letterHeader);
      
      meds.forEach(medicine => {
        // Determine frequency category for filtering
        let frequency = 'other';
        if (medicine.days.length === 7) {
          frequency = 'daily';
        } else if (medicine.days.length > 0 && medicine.days.length < 7) {
          frequency = 'weekly';
        }
        
        const medicineItem = document.createElement('div');
        medicineItem.classList.add('medicine-item');
        medicineItem.dataset.id = medicine.id;
        medicineItem.dataset.frequency = frequency;
        
        medicineItem.innerHTML = `
          <div class="medicine-color" style="background-color: ${medicine.color}"></div>
          <div class="medicine-details">
            <h3 class="medicine-name">${medicine.name}</h3>
            <p class="medicine-type">${medicine.type}</p>
            <p class="medicine-schedule">
              ${medicine.timeSlots.join(', ')} | ${medicine.days.join(', ')}
            </p>
          </div>
          <button class="view-details-btn" data-id="${medicine.id}">
            <i class="fas fa-chevron-right"></i>
          </button>
        `;
        
        medicineListContainer.appendChild(medicineItem);
        
        // Add click event for details
        medicineItem.querySelector('.view-details-btn').addEventListener('click', () => {
          openMedicineDetails(medicine);
        });
      });
    }
    
  } catch (error) {
    console.error('Error loading medicines:', error);
    medicineListContainer.innerHTML = '<p class="error-message">Failed to load medicines. Please try again.</p>';
  }
}

// Group medicines by first letter
function groupMedicinesByFirstLetter(medicines) {
  const grouped = {};
  
  medicines.forEach(medicine => {
    const firstLetter = medicine.name.charAt(0).toUpperCase();
    
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    
    grouped[firstLetter].push(medicine);
  });
  
  // Sort the groups
  return Object.keys(grouped)
    .sort()
    .reduce((obj, key) => {
      obj[key] = grouped[key];
      return obj;
    }, {});
}

// Open medicine details modal
function openMedicineDetails(medicine) {
  const modal = document.getElementById('medicine-detail-modal');
  const content = document.getElementById('medicine-detail-content');
  
  if (!modal || !content) return;
  
  // Format dates
  const startDate = new Date(medicine.startDate).toLocaleDateString();
  const endDate = new Date(medicine.endDate).toLocaleDateString();
  
  content.innerHTML = `
    <div class="detail-header" style="background-color: ${medicine.color}">
      <h2>${medicine.name}</h2>
      <span class="medicine-type">${medicine.type}</span>
    </div>
    <div class="detail-content">
      <div class="detail-item">
        <span class="detail-label">Time Slots:</span>
        <span class="detail-value">${medicine.timeSlots.join(', ')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Days:</span>
        <span class="detail-value">${medicine.days.join(', ')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Duration:</span>
        <span class="detail-value">${startDate} to ${endDate}</span>
      </div>
      ${medicine.notes ? `
        <div class="detail-item">
          <span class="detail-label">Notes:</span>
          <span class="detail-value">${medicine.notes}</span>
        </div>
      ` : ''}
    </div>
  `;
  
  // Set up action buttons
  const editButton = document.getElementById('edit-medicine');
  const deleteButton = document.getElementById('delete-medicine');
  
  if (editButton) {
    editButton.dataset.id = medicine.id;
    editButton.addEventListener('click', () => {
      window.location.href = `medicine-form.html?id=${medicine.id}`;
    });
  }
  
  if (deleteButton) {
    deleteButton.dataset.id = medicine.id;
    deleteButton.addEventListener('click', () => {
      openDeleteConfirmation(medicine.id, medicine.name);
    });
  }
  
  // Show modal
  modal.style.display = 'flex';
  
  // Close modal when clicking the X
  const closeBtn = modal.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.style.display = 'none';
    };
  }
  
  // Close modal when clicking outside
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// Open delete confirmation modal
function openDeleteConfirmation(id, name) {
  const modal = document.getElementById('confirmation-modal');
  
  if (!modal) return;
  
  // Update confirmation message
  const message = modal.querySelector('p');
  if (message) {
    message.textContent = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
  }
  
  // Show modal
  modal.style.display = 'flex';
  
  // Set up buttons
  const cancelButton = document.getElementById('cancel-delete');
  const confirmButton = document.getElementById('confirm-delete');
  
  if (cancelButton) {
    cancelButton.onclick = function() {
      modal.style.display = 'none';
    };
  }
  
  if (confirmButton) {
    confirmButton.onclick = async function() {
      try {
        modal.style.display = 'none';
        
        // Close detail modal as well
        const detailModal = document.getElementById('medicine-detail-modal');
        if (detailModal) {
          detailModal.style.display = 'none';
        }
        
        // Delete medicine
        await deleteMedicine(id);
        
        showToast('Medicine deleted successfully');
        
        // Reload medicines
        await loadMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
        showToast('Failed to delete medicine');
      }
    };
  }
  
  // Close when clicking outside
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// Set up modals
function setupModals() {
  // Close buttons for all modals
  const closeButtons = document.querySelectorAll('.close-btn');
  closeButtons.forEach(button => {
    const modal = button.closest('.modal');
    button.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  });
}
