// Application data from JSON
const appData = {
  "stats": {
    "totalDocuments": 2846,
    "activeAccounts": 3,
    "errorsToday": 2,
    "storageUsed": "45.7 GB"
  },
  "emailAccounts": [
    {
      "id": 1,
      "email": "john.doe@company.com",
      "provider": "Gmail",
      "status": "Active",
      "lastSync": "2 hours ago",
      "totalProcessed": 1247
    },
    {
      "id": 2,
      "email": "admin@business.org",
      "provider": "Outlook",
      "status": "Active",
      "lastSync": "5 minutes ago",
      "totalProcessed": 892
    },
    {
      "id": 3,
      "email": "support@service.net",
      "provider": "Yahoo",
      "status": "Active", 
      "lastSync": "1 hour ago",
      "totalProcessed": 707
    }
  ],
  "documentCategories": [
    {"name": "Invoices", "count": 524, "icon": "📄"},
    {"name": "Contracts", "count": 189, "icon": "📋"},
    {"name": "Reports", "count": 397, "icon": "📊"},
    {"name": "Presentations", "count": 156, "icon": "📑"},
    {"name": "Images", "count": 892, "icon": "🖼️"},
    {"name": "Archives", "count": 267, "icon": "📦"},
    {"name": "Other", "count": 421, "icon": "📁"}
  ],
  "recentDocuments": [
    {
      "id": 1,
      "filename": "Q4_Financial_Report.pdf",
      "sender": "finance@company.com",
      "received": "2024-12-01 14:30",
      "size": "2.4 MB",
      "category": "Reports",
      "status": "Processed"
    },
    {
      "id": 2,
      "filename": "Service_Contract_2024.docx",
      "sender": "legal@business.org",
      "received": "2024-12-01 13:15",
      "size": "1.8 MB",
      "category": "Contracts",
      "status": "Processed"
    },
    {
      "id": 3,
      "filename": "Invoice_INV-2024-001.pdf",
      "sender": "billing@supplier.com",
      "received": "2024-12-01 12:45",
      "size": "0.5 MB",
      "category": "Invoices",
      "status": "Processing"
    },
    {
      "id": 4,
      "filename": "Product_Presentation.pptx",
      "sender": "marketing@company.com",
      "received": "2024-12-01 11:20",
      "size": "15.2 MB",
      "category": "Presentations",
      "status": "Processed"
    },
    {
      "id": 5,
      "filename": "System_Backup.zip",
      "sender": "admin@company.com",
      "received": "2024-12-01 10:15",
      "size": "128.7 MB",
      "category": "Archives",
      "status": "Processed"
    }
  ]
};

// Extended documents for the documents page
const allDocuments = [
  ...appData.recentDocuments,
  {
    "id": 6,
    "filename": "Marketing_Strategy_2024.pptx",
    "sender": "marketing@company.com",
    "received": "2024-11-30 16:45",
    "size": "8.3 MB",
    "category": "Presentations",
    "status": "Processed"
  },
  {
    "id": 7,
    "filename": "Employee_Handbook.pdf",
    "sender": "hr@company.com",
    "received": "2024-11-30 14:20",
    "size": "3.7 MB",
    "category": "Other",
    "status": "Processed"
  },
  {
    "id": 8,
    "filename": "Product_Images.zip",
    "sender": "design@company.com",
    "received": "2024-11-30 11:15",
    "size": "45.2 MB",
    "category": "Images",
    "status": "Processed"
  },
  {
    "id": 9,
    "filename": "Supplier_Invoice_SI-2024-045.pdf",
    "sender": "suppliers@vendor.com",
    "received": "2024-11-29 09:30",
    "size": "1.2 MB",
    "category": "Invoices",
    "status": "Processing"
  },
  {
    "id": 10,
    "filename": "Annual_Report_2023.pdf",
    "sender": "finance@company.com",
    "received": "2024-11-29 08:15",
    "size": "12.8 MB",
    "category": "Reports",
    "status": "Processed"
  }
];

// Application state
let currentPage = 'dashboard';
let uploadQueue = [];

// DOM Elements
const sidebarItems = document.querySelectorAll('.sidebar-item');
const pages = document.querySelectorAll('.page');
const modal = document.getElementById('add-account-modal');
const toastContainer = document.getElementById('toast-container');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    populateDashboard();
    populateAccounts();
    populateDocuments();
    initializeUpload();
    initializeModal();
    initializeSettings();
});

// Navigation functionality
function initializeNavigation() {
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateToPage(page);
        });
    });
}

function navigateToPage(page) {
    // Update sidebar active state
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Update page visibility
    pages.forEach(pageElement => {
        pageElement.classList.add('hidden');
        if (pageElement.id === `${page}-page`) {
            pageElement.classList.remove('hidden');
        }
    });

    currentPage = page;
}

// Dashboard functionality
function populateDashboard() {
    // Populate recent documents
    const recentDocumentsTbody = document.getElementById('recent-documents-tbody');
    recentDocumentsTbody.innerHTML = '';
    
    appData.recentDocuments.forEach(doc => {
        const row = createDocumentRow(doc);
        recentDocumentsTbody.appendChild(row);
    });

    // Populate categories
    const categoriesGrid = document.getElementById('categories-grid');
    categoriesGrid.innerHTML = '';
    
    appData.documentCategories.forEach(category => {
        const categoryCard = createCategoryCard(category);
        categoriesGrid.appendChild(categoryCard);
    });
}

function createDocumentRow(doc) {
    const row = document.createElement('tr');
    const statusClass = doc.status.toLowerCase().replace(' ', '-');
    
    row.innerHTML = `
        <td>${doc.filename}</td>
        <td>${doc.sender}</td>
        <td>${formatDate(doc.received)}</td>
        <td>${doc.size}</td>
        <td>${doc.category}</td>
        <td><span class="status-badge ${statusClass}">${doc.status}</span></td>
    `;
    
    return row;
}

function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    
    card.innerHTML = `
        <div class="icon">${category.icon}</div>
        <h4>${category.name}</h4>
        <div class="count">${category.count.toLocaleString()}</div>
    `;
    
    return card;
}

// Email Accounts functionality
function populateAccounts() {
    const accountsGrid = document.getElementById('accounts-grid');
    accountsGrid.innerHTML = '';
    
    appData.emailAccounts.forEach(account => {
        const accountCard = createAccountCard(account);
        accountsGrid.appendChild(accountCard);
    });
}

function createAccountCard(account) {
    const card = document.createElement('div');
    card.className = 'account-card';
    
    card.innerHTML = `
        <div class="account-header">
            <div>
                <h3 class="account-email">${account.email}</h3>
                <p class="account-provider">${account.provider}</p>
            </div>
            <span class="status-badge ${account.status.toLowerCase()}">${account.status}</span>
        </div>
        <div class="account-info">
            <div>
                <span class="documents-count">${account.totalProcessed.toLocaleString()}</span> documents
            </div>
            <div>Last sync: ${account.lastSync}</div>
        </div>
    `;
    
    return card;
}

// Documents functionality
function populateDocuments() {
    const documentsTbody = document.getElementById('documents-tbody');
    const searchInput = document.getElementById('search-documents');
    const categoryFilter = document.getElementById('category-filter');
    
    function renderDocuments() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        
        const filteredDocuments = allDocuments.filter(doc => {
            const matchesSearch = doc.filename.toLowerCase().includes(searchTerm) ||
                                doc.sender.toLowerCase().includes(searchTerm);
            const matchesCategory = !selectedCategory || doc.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        documentsTbody.innerHTML = '';
        filteredDocuments.forEach(doc => {
            const row = createDocumentRow(doc);
            documentsTbody.appendChild(row);
        });
    }
    
    searchInput.addEventListener('input', renderDocuments);
    categoryFilter.addEventListener('change', renderDocuments);
    
    // Initial render
    renderDocuments();
}

// Upload functionality
function initializeUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const uploadItems = document.getElementById('upload-items');
    
    // Click to select files
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showToast('error', 'File too large', `${file.name} exceeds the 10MB limit`);
                return;
            }
            
            addToUploadQueue(file);
        });
    }
    
    function addToUploadQueue(file) {
        const uploadId = Date.now() + Math.random();
        const uploadItem = {
            id: uploadId,
            file: file,
            progress: 0,
            status: 'uploading'
        };
        
        uploadQueue.push(uploadItem);
        renderUploadItem(uploadItem);
        simulateUpload(uploadItem);
    }
    
    function renderUploadItem(item) {
        const uploadDiv = document.createElement('div');
        uploadDiv.className = 'upload-item';
        uploadDiv.id = `upload-${item.id}`;
        
        uploadDiv.innerHTML = `
            <div class="upload-info">
                <h4 class="upload-filename">${item.file.name}</h4>
                <p class="upload-size">${formatFileSize(item.file.size)}</p>
            </div>
            <div class="upload-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.progress}%"></div>
                </div>
            </div>
            <div class="upload-status">${item.progress}%</div>
        `;
        
        uploadItems.appendChild(uploadDiv);
    }
    
    function simulateUpload(item) {
        const interval = setInterval(() => {
            item.progress += Math.random() * 15;
            
            if (item.progress >= 100) {
                item.progress = 100;
                item.status = 'completed';
                clearInterval(interval);
                showToast('success', 'Upload Complete', `${item.file.name} has been uploaded successfully`);
            }
            
            updateUploadProgress(item);
        }, 200);
    }
    
    function updateUploadProgress(item) {
        const element = document.getElementById(`upload-${item.id}`);
        if (element) {
            const progressFill = element.querySelector('.progress-fill');
            const statusElement = element.querySelector('.upload-status');
            
            progressFill.style.width = `${item.progress}%`;
            statusElement.textContent = item.progress >= 100 ? 'Complete' : `${Math.round(item.progress)}%`;
        }
    }
}

// Modal functionality
function initializeModal() {
    const addAccountBtn = document.getElementById('add-account-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-add-account');
    const confirmBtn = document.getElementById('confirm-add-account');
    const form = document.getElementById('add-account-form');
    
    addAccountBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    confirmBtn.addEventListener('click', () => {
        const formData = new FormData(form);
        const email = document.getElementById('account-email').value;
        const provider = document.getElementById('account-provider').value;
        const password = document.getElementById('account-password').value;
        
        if (email && provider && password) {
            // Simulate adding account
            const newAccount = {
                id: appData.emailAccounts.length + 1,
                email: email,
                provider: provider,
                status: 'Active',
                lastSync: 'Just now',
                totalProcessed: 0
            };
            
            appData.emailAccounts.push(newAccount);
            populateAccounts();
            closeModal();
            form.reset();
            
            showToast('success', 'Account Added', `${email} has been added successfully`);
        } else {
            showToast('error', 'Validation Error', 'Please fill in all required fields');
        }
    });
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.classList.add('hidden');
        form.reset();
    }
}

// Settings functionality
function initializeSettings() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    const selects = document.querySelectorAll('#settings-page select');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const setting = toggle.id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const status = toggle.checked ? 'enabled' : 'disabled';
            showToast('info', 'Setting Updated', `${setting} has been ${status}`);
        });
    });
    
    selects.forEach(select => {
        select.addEventListener('change', () => {
            const settingName = select.id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const value = select.options[select.selectedIndex].text;
            showToast('info', 'Setting Updated', `${settingName} set to ${value}`);
        });
    });
}

// Toast notification system
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <h4 class="toast-title">${title}</h4>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}