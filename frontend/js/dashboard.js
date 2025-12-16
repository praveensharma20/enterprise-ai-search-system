// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Check if user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info in sidebar
    if (user.full_name) {
        document.querySelector('.user-name').textContent = user.full_name;
        document.querySelector('.user-email').textContent = user.email;
        
        // Update welcome message
        document.querySelector('.welcome-section h1').textContent = 
            `Welcome back, ${user.full_name.split(' ')[0]}! 👋`;
    }
    
    // Initialize dashboard features
    loadDocuments();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // File upload
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
}

// Handle file upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|docx)$/i)) {
        showNotification('Only PDF, TXT, and DOCX files are supported', 'error');
        return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        showNotification('Uploading document...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Document "${file.name}" uploaded successfully! Processing ${data.chunks_created} chunks.`, 'success');
            loadDocuments(); // Reload document list
            event.target.value = ''; // Clear file input
        } else {
            showNotification(data.detail || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error uploading document. Please try again.', 'error');
    }
}

// Handle search
async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('Please enter a search query', 'warning');
        return;
    }
    
    try {
        showNotification('Searching...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                top_k: 5,
                use_rag: true
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displaySearchResults(data);
            showNotification(`Found ${data.total_results} results`, 'success');
        } else {
            showNotification(data.detail || 'Search failed', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Error searching documents. Please try again.', 'error');
    }
}

// Display search results
function displaySearchResults(data) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    // Show RAG answer if available
    if (data.rag_answer) {
        const answerCard = document.createElement('div');
        answerCard.className = 'result-card rag-answer';
        answerCard.innerHTML = `
            <h3>🤖 AI Answer</h3>
            <p>${data.rag_answer}</p>
        `;
        resultsContainer.appendChild(answerCard);
    }
    
    // Show search results
    if (data.results && data.results.length > 0) {
        const resultsTitle = document.createElement('h3');
        resultsTitle.textContent = '📄 Relevant Documents';
        resultsContainer.appendChild(resultsTitle);
        
        data.results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            resultCard.innerHTML = `
                <div class="result-header">
                    <span class="result-number">#${index + 1}</span>
                    <span class="result-score">Score: ${(result.similarity_score * 100).toFixed(1)}%</span>
                </div>
                <h4>${result.file_name}</h4>
                <p class="result-content">${result.content}</p>
                <small>Chunk ${result.chunk_id}</small>
            `;
            resultsContainer.appendChild(resultCard);
        });
    } else {
        resultsContainer.innerHTML = '<p class="no-results">No results found</p>';
    }
}

// Load documents
async function loadDocuments() {
    const documentsContainer = document.getElementById('documentsList');
    if (!documentsContainer) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/documents`);
        const data = await response.json();
        
        if (response.ok && data.documents) {
            displayDocuments(data.documents);
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Display documents
function displayDocuments(documents) {
    const documentsContainer = document.getElementById('documentsList');
    if (!documentsContainer) return;
    
    if (documents.length === 0) {
        documentsContainer.innerHTML = '<p class="no-documents">No documents uploaded yet</p>';
        return;
    }
    
    documentsContainer.innerHTML = '';
    
    documents.forEach(doc => {
        const docCard = document.createElement('div');
        docCard.className = 'document-card';
        docCard.innerHTML = `
            <div class="doc-icon">📄</div>
            <div class="doc-info">
                <h4>${doc.file_name}</h4>
                <p>${doc.total_chunks} chunks</p>
                <small>${new Date(doc.upload_date).toLocaleDateString()}</small>
            </div>
            <button class="btn-delete" onclick="deleteDocument('${doc._id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        documentsContainer.appendChild(docCard);
    });
}

// Delete document
async function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Document deleted successfully', 'success');
            loadDocuments();
        } else {
            showNotification(data.detail || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting document', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Logout functionality
document.querySelector('.btn-logout').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', function() {
    body.classList.toggle('dark-mode');
    
    const icon = this.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    document.querySelector('#themeToggle i').classList.replace('fa-moon', 'fa-sun');
}

// Active navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Remove active from all
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        // Add active to clicked
        this.classList.add('active');
    });
});

// Update current date
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const currentDate = new Date().toLocaleDateString('en-US', options);
document.querySelector('.welcome-date').textContent = currentDate;
