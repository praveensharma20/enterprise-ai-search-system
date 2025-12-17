// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// ========================================
// 🚀 MAIN INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info
    if (user.full_name) {
        document.querySelector('.user-name').textContent = user.full_name;
        document.querySelector('.user-email').textContent = user.email;
        
        const welcomeHeader = document.querySelector('.welcome-section h1');
        if (welcomeHeader) {
            welcomeHeader.textContent = `Welcome back, ${user.full_name.split(' ')[0]}! 👋`;
        }
    }
    
    // Update current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = new Date().toLocaleDateString('en-US', options);
    const dateElement = document.querySelector('.welcome-date');
    if (dateElement) {
        dateElement.textContent = currentDate;
    }
    
    // Initialize all features
    setupSidebarToggle();
    setupUserDropdown();
    setupThemeToggle();
    setupSectionNavigation();
    setupEventListeners();
    loadDocuments();
    updateDocumentCount();
    
    console.log('Dashboard initialized successfully!');
});

// Keyboard shortcut: Ctrl+B to toggle sidebar
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) toggleBtn.click();
    }
});

// ========================================
// 🎯 SIDEBAR TOGGLE FUNCTIONALITY
// ========================================

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const body = document.body;
    
    if (!sidebar || !sidebarToggle) {
        console.warn('Sidebar or toggle button not found');
        return;
    }
    
    sidebarToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        body.classList.toggle('sidebar-collapsed');
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        
        const icon = sidebarToggle.querySelector('i');
        if (isCollapsed) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-angles-right');
        } else {
            icon.classList.remove('fa-angles-right');
            icon.classList.add('fa-bars');
        }
    });
    
    // Load saved sidebar state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        body.classList.add('sidebar-collapsed');
        const icon = sidebarToggle.querySelector('i');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-angles-right');
    }
    
    console.log('Sidebar toggle initialized');
}

// ========================================
// 👤 USER PROFILE DROPDOWN
// ========================================

function setupUserDropdown() {
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!userAvatar || !userDropdown) {
        console.warn('User dropdown elements not found');
        return;
    }
    
    // Toggle dropdown on avatar click
    userAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Load user email from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const dropdownEmail = document.getElementById('dropdownEmail');
    if (dropdownEmail && userData.email) {
        dropdownEmail.textContent = userData.email;
    }
    
    console.log('User dropdown initialized');
}

function showProfileSection() {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.classList.remove('show');
    }
    showNotification('Profile section coming soon!', 'info');
}

function navigateTo(section) {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.classList.remove('show');
    }
    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) {
        navItem.click();
    }
}

function logout() {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.classList.remove('show');
    }
    
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// ========================================
// 🌙 THEME TOGGLE
// ========================================

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) {
        console.warn('Theme toggle not found');
        return;
    }
    
    themeToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        body.classList.toggle('dark-mode');
        
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    
    console.log('Theme toggle initialized');
}

// ========================================
// 📑 SECTION NAVIGATION
// ========================================

function setupSectionNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            
            // Remove active from all nav items
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            
            // Remove active from all sections
            document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
            
            // Add active to clicked nav
            this.classList.add('active');
            
            // Show selected section
            const targetSection = document.getElementById(`section-${section}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ========================================
// 🎯 EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Primary upload button (Quick Actions)
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Alternative upload button (Documents section)
    const uploadBtnAlt = document.getElementById('uploadBtnAlt');
    if (uploadBtnAlt && fileInput) {
        uploadBtnAlt.addEventListener('click', () => fileInput.click());
    }
    
    // Header search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Main search (Search section)
    const searchBtnMain = document.getElementById('searchBtnMain');
    const searchInputMain = document.getElementById('searchInputMain');
    
    if (searchBtnMain && searchInputMain) {
        searchBtnMain.addEventListener('click', () => {
            const query = searchInputMain.value.trim();
            if (query) {
                performSearch(query);
            }
        });
        
        searchInputMain.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtnMain.click();
            }
        });
    }
}

// ========================================
// 📤 FILE UPLOAD
// ========================================

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
            loadDocuments();
            updateDocumentCount();
            event.target.value = '';
            
            setTimeout(() => {
                document.querySelector('[data-section="documents"]')?.click();
            }, 1000);
        } else {
            showNotification(data.detail || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error uploading document. Please try again.', 'error');
    }
}

// ========================================
// 🔍 SEARCH
// ========================================

async function performSearch(query = null) {
    const searchQuery = query || document.getElementById('searchInput')?.value.trim();
    
    if (!searchQuery) {
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
                query: searchQuery,
                top_k: 5,
                use_rag: true
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displaySearchResults(data);
            showNotification(`Found ${data.total_results} results`, 'success');
            
            setTimeout(() => {
                document.querySelector('[data-section="search"]')?.click();
            }, 300);
        } else {
            showNotification(data.detail || 'Search failed', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Error searching documents. Please try again.', 'error');
    }
}

function displaySearchResults(data) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    // Show RAG answer if available
    if (data.rag_answer) {
        const answerCard = document.createElement('div');
        answerCard.className = 'result-card rag-answer';
        answerCard.innerHTML = `
            <h3>🤖 AI-Generated Answer</h3>
            <p class="result-content">${data.rag_answer}</p>
        `;
        resultsContainer.appendChild(answerCard);
    }
    
    // Show search results
    if (data.results && data.results.length > 0) {
        const resultsTitle = document.createElement('h3');
        resultsTitle.textContent = '📄 Relevant Documents';
        resultsTitle.style.marginTop = '2rem';
        resultsTitle.style.marginBottom = '1rem';
        resultsContainer.appendChild(resultsTitle);
        
        data.results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            resultCard.innerHTML = `
                <div class="result-header">
                    <span class="result-number">#${index + 1}</span>
                    <span class="result-score">Relevance: ${(result.similarity_score * 100).toFixed(1)}%</span>
                </div>
                <h4>📄 ${result.file_name}</h4>
                <p class="result-content">${result.content}</p>
                <small style="color: #9CA3AF;">Chunk ${result.chunk_id}</small>
            `;
            resultsContainer.appendChild(resultCard);
        });
    } else if (!data.rag_answer) {
        resultsContainer.innerHTML = '<p class="no-results">No results found. Try different keywords.</p>';
    }
}

// ========================================
// 📄 DOCUMENTS
// ========================================

async function loadDocuments() {
    const documentsContainer = document.getElementById('documentsList');
    if (!documentsContainer) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/documents`);
        const data = await response.json();
        
        if (response.ok && data.documents) {
            displayDocuments(data.documents);
            updateDocumentCount(data.documents.length);
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        if (documentsContainer) {
            documentsContainer.innerHTML = '<p class="no-documents">Error loading documents</p>';
        }
    }
}

function displayDocuments(documents) {
    const documentsContainer = document.getElementById('documentsList');
    if (!documentsContainer) return;
    
    if (!documents || documents.length === 0) {
        documentsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #9CA3AF;">
                <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p class="no-documents">No documents uploaded yet</p>
                <button onclick="document.getElementById('uploadBtn').click()" 
                        style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: #7C3AED; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Upload Your First Document
                </button>
            </div>
        `;
        return;
    }
    
    documentsContainer.innerHTML = '';
    
    documents.forEach(doc => {
        const docCard = document.createElement('div');
        docCard.className = 'document-card';
        
        const fileName = doc.file_name || 'Unknown';
        
        let iconClass = 'fa-file';
        if (fileName.endsWith('.pdf')) iconClass = 'fa-file-pdf';
        else if (fileName.endsWith('.docx')) iconClass = 'fa-file-word';
        else if (fileName.endsWith('.txt')) iconClass = 'fa-file-alt';
        
        const documentId = doc.document_id || doc._id || 'unknown';
        const displayId = String(documentId).substring(0, 8);
        const uploadDate = doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : 'Unknown date';
        
        docCard.innerHTML = `
            <div class="doc-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="doc-info">
                <h4>${fileName}</h4>
                <p>${doc.total_chunks || 0} chunks • Uploaded ${uploadDate}</p>
                <small>ID: ${displayId}...</small>
            </div>
            <button class="btn-delete" onclick="deleteDocument('${documentId}', '${fileName}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        documentsContainer.appendChild(docCard);
    });
}

async function deleteDocument(documentId, fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    
    try {
        showNotification('Deleting document...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Document deleted successfully', 'success');
            loadDocuments();
            updateDocumentCount();
        } else {
            showNotification(data.detail || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting document', 'error');
    }
}

async function updateDocumentCount(count = null) {
    const totalDocsElement = document.getElementById('totalDocs');
    if (!totalDocsElement) return;
    
    if (count !== null) {
        totalDocsElement.textContent = count;
    } else {
        try {
            const response = await fetch(`${API_BASE_URL}/documents`);
            const data = await response.json();
            if (response.ok && data.documents) {
                totalDocsElement.textContent = data.documents.length;
            }
        } catch (error) {
            console.error('Error updating document count:', error);
        }
    }
}

// ========================================
// 🔔 NOTIFICATIONS
// ========================================

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = '💬';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'info') icon = 'ℹ️';
    
    notification.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}