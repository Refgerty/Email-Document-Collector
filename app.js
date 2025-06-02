document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather Icons
    feather.replace();

    // Initialize navigation
    initNavigation();
    
    // Initialize modals
    initModals();
    
    // Initialize Dashboard Chart
    initDashboardChart();
    
    // Initialize Document Filtering
    initDocumentFiltering();
    
    // Initialize Upload functionality
    initUploadFunctionality();
    
    // Initialize Settings
    initSettings();
    
    // Initialize Email Accounts Actions
    initAccountActions();
});

// Navigation functionality
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    const sidebarToggle = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // Navigation click handler
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get section ID
            const sectionId = item.dataset.section;
            
            // Hide all sections
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Update section title
            sectionTitle.textContent = item.querySelector('span').textContent;
            
            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
            
            // Update URL hash
            window.location.hash = sectionId;
        });
    });
    
    // Check for URL hash on page load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const navItem = document.querySelector(`.nav-item[data-section="${hash}"]`);
        if (navItem) {
            navItem.click();
        }
    }
    
    // Quick actions navigation
    document.querySelectorAll('.quick-actions button').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.textContent.trim();
            
            if (action.includes('Email Account')) {
                // Navigate to email accounts and open modal
                document.querySelector('.nav-item[data-section="email-accounts"]').click();
                showModal('add-account-modal');
            } else if (action.includes('Upload')) {
                // Navigate to upload section
                document.querySelector('.nav-item[data-section="upload"]').click();
            } else if (action.includes('Sync')) {
                // Show sync toast
                showToast('Syncing all accounts...', 'info');
                setTimeout(() => {
                    showToast('All accounts synced successfully!', 'success');
                }, 2000);
            } else if (action.includes('Settings')) {
                // Navigate to settings
                document.querySelector('.nav-item[data-section="settings"]').click();
            }
        });
    });
}

// Modal functionality
function initModals() {
    const addAccountBtn = document.getElementById('add-account-btn');
    const modalClose = document.getElementById('modal-close');
    const cancelAddAccount = document.getElementById('cancel-add-account');
    const submitAddAccount = document.getElementById('submit-add-account');
    const addAccountModal = document.getElementById('add-account-modal');
    const emailProvider = document.getElementById('email-provider');
    const imapSettings = document.getElementById('imap-settings');
    
    // Show modal when Add Account button is clicked
    addAccountBtn.addEventListener('click', () => {
        showModal('add-account-modal');
    });
    
    // Close modal when X button is clicked
    modalClose.addEventListener('click', () => {
        hideModal('add-account-modal');
    });
    
    // Close modal when Cancel button is clicked
    cancelAddAccount.addEventListener('click', () => {
        hideModal('add-account-modal');
    });
    
    // Handle form submission
    submitAddAccount.addEventListener('click', (e) => {
        e.preventDefault();
        
        const emailAddress = document.getElementById('email-address').value;
        const emailPassword = document.getElementById('email-password').value;
        const provider = emailProvider.value;
        
        if (!emailAddress || !emailPassword) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        
        // Additional validation for IMAP settings
        if (provider === 'imap') {
            const imapServer = document.getElementById('imap-server').value;
            const imapPort = document.getElementById('imap-port').value;
            
            if (!imapServer || !imapPort) {
                showToast('Please fill in IMAP server information.', 'error');
                return;
            }
        }
        
        // Show loading state
        submitAddAccount.innerHTML = '<i data-feather="loader"></i> Adding...';
        submitAddAccount.disabled = true;
        feather.replace();
        
        // Simulate API call
        setTimeout(() => {
            hideModal('add-account-modal');
            showToast(`Successfully connected to ${emailAddress}`, 'success');
            
            // Reset form
            document.getElementById('add-account-form').reset();
            submitAddAccount.innerHTML = 'Add Account';
            submitAddAccount.disabled = false;
            
            // Add new account to the grid
            addNewAccount(emailAddress, provider);
        }, 2000);
    });
    
    // Toggle IMAP settings based on provider selection
    emailProvider.addEventListener('change', () => {
        if (emailProvider.value === 'imap') {
            imapSettings.classList.remove('hidden');
        } else {
            imapSettings.classList.add('hidden');
        }
    });
}

// Show modal function
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

// Hide modal function
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// Toast notification function
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon;
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'alert-circle';
            break;
        case 'warning':
            icon = 'alert-triangle';
            break;
        default:
            icon = 'info';
    }
    
    toast.innerHTML = `
        <i data-feather="${icon}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close">
            <i data-feather="x"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Replace feather icons
    feather.replace();
    
    // Show the toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Dashboard Chart
function initDashboardChart() {
    const ctx = document.getElementById('documentsChart');
    if (!ctx) return;
    
    const chartData = {
        labels: ['May 26', 'May 27', 'May 28', 'May 29', 'May 30', 'May 31', 'Jun 01', 'Jun 02'],
        datasets: [{
            label: 'Documents Processed',
            data: [45, 52, 38, 67, 74, 83, 91, 78],
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            borderColor: 'rgba(6, 182, 212, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(6, 182, 212, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
}

// Document Filtering
function initDocumentFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const documentList = document.getElementById('documents-list');
    const documentSearch = document.getElementById('document-search');
    
    if (!filterButtons.length || !documentList || !documentSearch) return;
    
    // Handle filter button clicks
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get selected filter
            const filter = button.dataset.filter;
            
            // Apply filtering
            filterDocuments(filter);
        });
    });
    
    // Handle search input
    documentSearch.addEventListener('input', () => {
        const searchTerm = documentSearch.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        filterDocuments(activeFilter, searchTerm);
    });
    
    function filterDocuments(filter, searchTerm = '') {
        const rows = documentList.querySelectorAll('tr');
        
        rows.forEach(row => {
            const category = row.querySelector('.category-badge')?.textContent;
            const name = row.querySelector('.document-name span')?.textContent.toLowerCase();
            const sender = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase();
            
            const matchesFilter = filter === 'all' || category === filter;
            const matchesSearch = !searchTerm || 
                                name?.includes(searchTerm) || 
                                sender?.includes(searchTerm);
            
            if (matchesFilter && matchesSearch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Upload Functionality
function initUploadFunctionality() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressList = document.getElementById('progress-list');
    
    if (!dropzone || !fileInput || !progressContainer || !progressList) return;
    
    // Handle drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('dragover');
        });
    });
    
    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    // Handle selected files
    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        handleFiles(files);
    });
    
    function handleFiles(files) {
        if (!files.length) return;
        
        // Show progress container
        progressContainer.classList.add('show');
        
        // Process each file
        Array.from(files).forEach(file => {
            uploadFile(file);
        });
    }
    
    function uploadFile(file) {
        // Create progress item
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-header">
                <div class="progress-filename">${file.name}</div>
                <div class="progress-percentage">0%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        
        progressList.appendChild(progressItem);
        
        // Simulate upload progress
        let progress = 0;
        const progressFill = progressItem.querySelector('.progress-fill');
        const progressPercentage = progressItem.querySelector('.progress-percentage');
        
        const interval = setInterval(() => {
            progress += 5;
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // Show success message
                setTimeout(() => {
                    // Replace progress item with success message
                    progressItem.innerHTML = `
                        <div class="progress-header">
                            <div class="progress-filename">${file.name}</div>
                            <div class="progress-status">
                                <span class="status status--success">Complete</span>
                            </div>
                        </div>
                    `;
                    
                    // Show toast notification
                    showToast(`${file.name} uploaded successfully!`, 'success');
                    
                    // Add to recent uploads
                    addToRecentUploads(file);
                }, 500);
            }
        }, 100);
    }
    
    function addToRecentUploads(file) {
        const tbody = document.querySelector('.upload-table tbody');
        if (!tbody) return;
        
        const date = new Date().toISOString().split('T')[0];
        const type = getFileType(file.name);
        const size = formatFileSize(file.size);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="document-name">
                <i data-feather="file-text"></i>
                <span>${file.name}</span>
            </td>
            <td>${size}</td>
            <td>${type}</td>
            <td>${date}</td>
            <td>
                <span class="status status--success">Complete</span>
            </td>
        `;
        
        tbody.prepend(tr);
        feather.replace();
    }
    
    function getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        if (['pdf'].includes(ext)) return 'PDF';
        if (['doc', 'docx'].includes(ext)) return 'Document';
        if (['xls', 'xlsx'].includes(ext)) return 'Spreadsheet';
        if (['ppt', 'pptx'].includes(ext)) return 'Presentation';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'Image';
        if (['zip', 'rar'].includes(ext)) return 'Archive';
        
        return 'Other';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Settings functionality
function initSettings() {
    const autoSyncToggle = document.getElementById('auto-sync-toggle');
    const syncInterval = document.getElementById('sync-interval');
    const maxFileSize = document.getElementById('max-file-size');
    const retentionPeriod = document.getElementById('retention-period');
    const emailNotificationsToggle = document.getElementById('email-notifications-toggle');
    const errorNotificationsToggle = document.getElementById('error-notifications-toggle');
    const saveBtn = document.querySelector('.settings-actions .btn--primary');
    const resetBtn = document.querySelector('.settings-actions .btn--secondary');
    
    if (!autoSyncToggle || !syncInterval || !saveBtn || !resetBtn) return;
    
    // Set initial values from settings data
    syncInterval.value = 5; // Default to 5 minutes
    
    // Save button click handler
    saveBtn.addEventListener('click', () => {
        // Collect settings
        const settings = {
            autoSync: autoSyncToggle.checked,
            syncInterval: parseInt(syncInterval.value, 10),
            maxFileSize: parseInt(maxFileSize.value, 10),
            retentionPeriod: parseInt(retentionPeriod.value, 10),
            emailNotifications: emailNotificationsToggle.checked,
            errorNotifications: errorNotificationsToggle.checked
        };
        
        // Save settings (would normally send to server)
        console.log('Settings saved:', settings);
        
        // Show success toast
        showToast('Settings saved successfully!', 'success');
    });
    
    // Reset button click handler
    resetBtn.addEventListener('click', () => {
        // Reset to default values
        autoSyncToggle.checked = true;
        syncInterval.value = 5;
        maxFileSize.value = 50;
        retentionPeriod.value = 24;
        emailNotificationsToggle.checked = true;
        errorNotificationsToggle.checked = true;
        
        // Show info toast
        showToast('Settings reset to defaults.', 'info');
    });
}

// Email accounts actions
function initAccountActions() {
    const syncButtons = document.querySelectorAll('.account-actions button:first-child');
    
    // Add event listeners to sync buttons
    syncButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const accountCard = e.target.closest('.account-card');
            const accountEmail = accountCard.querySelector('.account-email').textContent;
            
            // Disable button and show syncing
            button.disabled = true;
            button.innerHTML = '<i data-feather="loader"></i> Syncing...';
            feather.replace();
            
            // Set status to syncing
            const statusEl = accountCard.querySelector('.account-status span');
            statusEl.className = 'status status--warning';
            statusEl.textContent = 'Syncing';
            
            // Simulate sync
            setTimeout(() => {
                // Update status
                statusEl.className = 'status status--success';
                statusEl.textContent = 'Connected';
                
                // Re-enable button
                button.disabled = false;
                button.innerHTML = '<i data-feather="refresh-cw"></i> Sync';
                feather.replace();
                
                // Show toast
                showToast(`${accountEmail} synced successfully!`, 'success');
                
                // Update last sync time
                const lastSyncEl = accountCard.querySelector('.account-stat:nth-child(2) .stat-value');
                lastSyncEl.textContent = 'Just now';
            }, 2000);
        });
    });
}

// Add new account to the grid
function addNewAccount(email, provider) {
    const accountsGrid = document.querySelector('.accounts-grid');
    if (!accountsGrid) return;
    
    // Convert provider to proper case
    const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    
    // Create an icon based on provider
    let icon;
    switch (provider) {
        case 'gmail':
            icon = '📧';
            break;
        case 'outlook':
            icon = '📩';
            break;
        case 'yahoo':
            icon = '📨';
            break;
        default:
            icon = '📮';
    }
    
    // Create new account card
    const newAccount = document.createElement('div');
    newAccount.className = 'account-card';
    newAccount.innerHTML = `
        <div class="account-header">
            <div class="account-icon ${provider}">${icon}</div>
            <div class="account-status">
                <span class="status status--success">Connected</span>
            </div>
        </div>
        <div class="account-body">
            <h4 class="account-email">${email}</h4>
            <p class="account-provider">${formattedProvider}</p>
            <div class="account-stats">
                <div class="account-stat">
                    <span class="stat-label">Documents</span>
                    <span class="stat-value">0</span>
                </div>
                <div class="account-stat">
                    <span class="stat-label">Last Sync</span>
                    <span class="stat-value">Just now</span>
                </div>
            </div>
        </div>
        <div class="account-actions">
            <button class="btn btn--secondary btn--sm">
                <i data-feather="refresh-cw"></i>
                Sync
            </button>
            <button class="btn btn--secondary btn--sm">
                <i data-feather="settings"></i>
            </button>
            <button class="btn btn--secondary btn--sm">
                <i data-feather="trash-2"></i>
            </button>
        </div>
    `;
    
    // Add to grid
    accountsGrid.appendChild(newAccount);
    
    // Initialize feather icons
    feather.replace();
    
    // Update stats card
    const accountsCountEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (accountsCountEl) {
        const currentCount = parseInt(accountsCountEl.textContent.trim(), 10);
        accountsCountEl.textContent = currentCount + 1;
    }
    
    // Add event listeners to new buttons
    initAccountActions();
}