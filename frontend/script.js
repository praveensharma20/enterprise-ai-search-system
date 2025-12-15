// frontend/script.js

const API_URL = 'http://localhost:8000';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const useRAGCheckbox = document.getElementById('useRAG');
const topKSelect = document.getElementById('topK');
const resultsSection = document.getElementById('resultsSection');
const ragAnswer = document.getElementById('ragAnswer');
const answerContent = document.getElementById('answerContent');
const resultsList = document.getElementById('resultsList');
const resultsCount = document.getElementById('resultsCount');
const searchTime = document.getElementById('searchTime');
const documentsList = document.getElementById('documentsList');
const refreshBtn = document.getElementById('refreshBtn');
const statusBadge = document.getElementById('statusBadge');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    loadDocuments();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Upload events
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.closest('.upload-content')) {
            fileInput.click();
        }
    });
    
    // Search events
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Refresh documents
    refreshBtn.addEventListener('click', loadDocuments);
}

// Health Check
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            statusBadge.innerHTML = '<i class="fas fa-circle"></i> Online';
            statusBadge.classList.add('online');
            statusBadge.classList.remove('offline');
        } else {
            statusBadge.innerHTML = '<i class="fas fa-circle"></i> Offline';
            statusBadge.classList.add('offline');
            statusBadge.classList.remove('online');
        }
    } catch (error) {
        statusBadge.innerHTML = '<i class="fas fa-circle"></i> Offline';
        statusBadge.classList.add('offline');
        statusBadge.classList.remove('online');
        console.error('Health check failed:', error);
    }
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragging');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

// File Upload
async function handleFileUpload(file) {
    // Validate file
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    
    const isValidType = allowedTypes.includes(file.type) || 
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
        showToast('Unsupported file type. Please upload PDF, TXT, or DOCX files.', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showToast('File too large. Maximum size is 10MB.', 'error');
        return;
    }
    
    // Show progress
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading...';
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                progressFill.style.width = progress + '%';
            }
        }, 200);
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        
        const data = await response.json();
        
        if (response.ok) {
            progressText.textContent = `✅ Success! Created ${data.chunks_created} chunks in ${data.processing_time}s`;
            showToast(`Document uploaded successfully! (${data.chunks_created} chunks)`, 'success');
            
            // Reload documents
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                fileInput.value = '';
                loadDocuments();
            }, 2000);
        } else {
            throw new Error(data.detail || 'Upload failed');
        }
    } catch (error) {
        progressFill.style.width = '0%';
        progressText.textContent = '❌ Upload failed';
        showToast('Error uploading document: ' + error.message, 'error');
        
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 3000);
    }
}

// Search Documents
async function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showToast('Please enter a search query', 'error');
        return;
    }
    
    // Show loading
    loadingOverlay.style.display = 'flex';
    
    try {
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                top_k: parseInt(topKSelect.value),
                use_rag: useRAGCheckbox.checked
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displaySearchResults(data);
        } else {
            throw new Error(data.detail || 'Search failed');
        }
    } catch (error) {
        showToast('Search error: ' + error.message, 'error');
        console.error('Search error:', error);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Display Search Results
function displaySearchResults(data) {
    resultsSection.style.display = 'block';
    
    // Update info
    resultsCount.textContent = `${data.total_results} result(s)`;
    searchTime.textContent = `Search time: ${data.processing_time}s`;
    
    // Display RAG answer
    if (data.rag_answer) {
        ragAnswer.style.display = 'block';
        answerContent.textContent = data.rag_answer;
    } else {
        ragAnswer.style.display = 'none';
    }
    
    // Display results
    if (data.results.length === 0) {
        resultsList.innerHTML = '<p class="empty-state">No results found</p>';
    } else {
        resultsList.innerHTML = data.results.map((result, index) => `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-file">
                        <i class="fas fa-file-alt"></i>
                        ${result.file_name} (Chunk ${result.chunk_id})
                    </div>
                    <div class="similarity-badge">
                        ${(result.similarity_score * 100).toFixed(1)}% match
                    </div>
                </div>
                <div class="result-content">
                    ${highlightQuery(result.content, data.query)}
                </div>
            </div>
        `).join('');
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Highlight query terms in content
function highlightQuery(content, query) {
    const words = query.toLowerCase().split(' ');
    let highlighted = content;
    
    words.forEach(word => {
        if (word.length > 3) {
            const regex = new RegExp(`(${word})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        }
    });
    
    return highlighted;
}

// Load Documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_URL}/documents`);
        const data = await response.json();
        
        if (data.total_count === 0) {
            documentsList.innerHTML = '<p class="empty-state">No documents uploaded yet</p>';
        } else {
            documentsList.innerHTML = data.documents.map(doc => `
                <div class="document-card">
                    <div class="document-info">
                        <div class="document-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="document-details">
                            <h4>${doc.file_name}</h4>
                            <div class="document-meta">
                                ${doc.total_chunks} chunks • 
                                Uploaded: ${new Date(doc.upload_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-danger" onclick="deleteDocument('${doc.document_id}', '${doc.file_name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        showToast('Error loading documents', 'error');
    }
}

// Delete Document
async function deleteDocument(documentId, fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/documents/${documentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(`Document deleted successfully (${data.chunks_deleted} chunks removed)`, 'success');
            loadDocuments();
        } else {
            throw new Error(data.detail || 'Delete failed');
        }
    } catch (error) {
        showToast('Error deleting document: ' + error.message, 'error');
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Auto-refresh health status
setInterval(checkHealth, 30000); // Check every 30 seconds
