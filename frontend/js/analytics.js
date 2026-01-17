// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Load analytics data on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Analytics page loaded');
    loadAnalytics();
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('🔄 Refresh button clicked');
            loadAnalytics();
        });
    }
});

// Load analytics data from API
async function loadAnalytics() {
    console.log('🔍 Loading analytics data...');
    
    // Show loading state
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>Loading...</p>
        </div>
    `;
    
    try {
        // ✅ FIXED: Use correct endpoint /analytics/stats
        const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Analytics data received:', data);
            displayAnalytics(data);
        } else {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            showError('Failed to load analytics data. Please check if the server is running.');
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
        showError('Cannot connect to server. Make sure backend is running on http://localhost:8000');
    }
}

// Display analytics data
function displayAnalytics(data) {
    console.log('📊 Displaying analytics:', data);
    
    // Update stats
    const totalDocs = data.total_documents || 0;
    const totalSearches = data.total_searches || 0;
    const fileTypes = data.documents_by_type ? data.documents_by_type.length : 0;
    
    document.getElementById('totalDocs').textContent = totalDocs;
    document.getElementById('totalSearches').textContent = totalSearches;
    document.getElementById('fileTypes').textContent = fileTypes;
    
    console.log(`📈 Stats: ${totalDocs} docs, ${totalSearches} searches, ${fileTypes} types`);

    // Display recent searches
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    if (data.recent_searches && data.recent_searches.length > 0) {
        console.log(`📝 Displaying ${data.recent_searches.length} recent searches`);
        
        data.recent_searches.forEach((search, index) => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            // Format timestamp
            let timestamp = 'Unknown';
            if (search.timestamp) {
                try {
                    const date = new Date(search.timestamp);
                    timestamp = date.toLocaleString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    timestamp = search.timestamp;
                }
            }
            
            const processingTime = search.processing_time ? `${search.processing_time}s` : 'N/A';
            const resultsCount = search.results_count || 0;
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-search"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-query">${escapeHtml(search.query)}</div>
                    <div class="activity-meta">
                        <span class="result-badge">${resultsCount} result${resultsCount !== 1 ? 's' : ''}</span>
                        <span class="time-badge">${processingTime}</span>
                        <span class="timestamp">${timestamp}</span>
                    </div>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
    } else {
        console.log('ℹ️ No recent searches found');
        activityList.innerHTML = `
            <div class="no-activity">
                <i class="fas fa-search"></i>
                <p>No recent search activity</p>
            </div>
        `;
    }
}

// Show error message
function showError(message) {
    console.error('💥 Showing error:', message);
    
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = `
        <div class="no-data">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ Analytics.js loaded successfully!');
