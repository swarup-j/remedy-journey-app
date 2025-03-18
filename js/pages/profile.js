
// Profile page initialization and functionality
import { getUserProfile, getAdherenceStats } from '../api/userApi.js';
import { fetchMedicines } from '../api/medicineApi.js';
import { showToast, setupOfflineDetection } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Setup offline detection
  setupOfflineDetection();
  
  // Initialize profile page
  initializeProfilePage();
});

async function initializeProfilePage() {
  try {
    // Set current date
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
      currentDateElement.textContent = new Date().toLocaleDateString();
    }
    
    // Fetch user profile
    const profile = await getUserProfile();
    
    // Update UI with user info
    document.getElementById('user-name').textContent = profile.name || 'User';
    document.getElementById('user-email').textContent = profile.email || 'No email';
    
    // Fetch adherence statistics
    const stats = await getAdherenceStats();
    
    // Update UI with statistics
    document.getElementById('adherence-rate').textContent = 
      stats.adherenceRate !== undefined ? `${stats.adherenceRate}%` : 'N/A';
    document.getElementById('active-medications').textContent = 
      stats.activeMedicines !== undefined ? stats.activeMedicines : 'N/A';
    
    // Load medicine summary
    await loadMedicineSummary();
    
  } catch (error) {
    console.error('Error loading profile data:', error);
    showToast('Error loading profile data');
  }
}

// Load medicine summary for profile page
async function loadMedicineSummary() {
  const summaryContainer = document.getElementById('medicine-summary');
  if (!summaryContainer) return;
  
  try {
    const medicines = await fetchMedicines();
    
    if (medicines.length === 0) {
      summaryContainer.innerHTML = '<p>No medicines found.</p>';
      return;
    }
    
    // Count by type
    const typeCount = {};
    medicines.forEach(medicine => {
      if (!typeCount[medicine.type]) {
        typeCount[medicine.type] = 0;
      }
      typeCount[medicine.type]++;
    });
    
    // Create pie chart (simplified version)
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('simple-pie-chart');
    
    const chartLegend = document.createElement('div');
    chartLegend.classList.add('chart-legend');
    
    // Standard colors for medicine types
    const colors = {
      'tablet': '#FF6384',
      'capsule': '#36A2EB',
      'liquid': '#FFCE56',
      'injection': '#4BC0C0',
      'topical': '#9966FF',
      'other': '#C9CBCF'
    };
    
    // Add legend items
    Object.entries(typeCount).forEach(([type, count]) => {
      const color = colors[type] || colors.other;
      
      const legendItem = document.createElement('div');
      legendItem.classList.add('legend-item');
      legendItem.innerHTML = `
        <span class="legend-color" style="background-color: ${color}"></span>
        <span class="legend-label">${type} (${count})</span>
      `;
      
      chartLegend.appendChild(legendItem);
    });
    
    // Add chart and legend to container
    summaryContainer.innerHTML = '<h3>Medicine Types</h3>';
    summaryContainer.appendChild(chartContainer);
    summaryContainer.appendChild(chartLegend);
    
  } catch (error) {
    console.error('Error loading medicine summary:', error);
    summaryContainer.innerHTML = '<p>Failed to load medicine summary.</p>';
  }
}
