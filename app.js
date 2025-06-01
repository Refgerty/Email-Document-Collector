// Application data from JSON
const appData = {
  "stats": {
    "totalDocuments": 2846,
    "activeAccounts": 3,
    "errorsToday": 2,
    "storageUsed": "45.7 ГБ"
  },
  "emailAccounts": [
    {
      "id": 1,
      "email": "john.doe@company.com",
      "provider": "Gmail",
      "status": "Active",
      "lastSync": "2 часа назад",
      "totalProcessed": 1247
    },
    {
      "id": 2,
      "email": "admin@business.org",
      "provider": "Outlook",
      "status": "Active",
      "lastSync": "5 минут назад",
      "totalProcessed": 892
    },
    {
      "id": 3,
      "email": "support@service.net",
      "provider": "Yahoo",
      "status": "Syncing",
      "lastSync": "1 час назад",
      "totalProcessed": 707
    }
  ],
  "documentCategories": [
    {"name": "Invoices", "russianName": "Счета", "count": 524, "icon": "📄"},
    {"name": "Contracts", "russianName": "Контракты", "count": 189, "icon": "📋"},
    {"name": "Reports", "russianName": "Отчеты", "count": 397, "icon": "📊"},
    {"name": "Presentations", "russianName": "Презентации", "count": 156, "icon": "📑"},
    {"name": "Images", "russianName": "Изображения", "count": 892, "icon": "🖼️"},
    {"name": "Archives", "russianName": "Архивы", "count": 267, "icon": "📦"},
    {"name": "Other", "russianName": "Прочее", "count": 421, "icon": "📁"}
  ],
  "recentDocuments": [
    {
      "id": 1,
      "filename": "Q4_Financial_Report.pdf",
      "sender": "finance@company.com",
      "received": "2024-12-01 14:30",
      "size": "2.4 МБ",
      "category": "Reports",
      "status": "Processed"
    },
    {
      "id": 2,
      "filename": "Service_Contract_2024.docx",
      "sender": "legal@business.org",
      "received": "2024-12-01 13:15",
      "size": "1.8 МБ",
      "category": "Contracts",
      "status": "Processed"
    },
    {
      "id": 3,
      "filename": "Invoice_INV-2024-001.pdf",
      "sender": "billing@supplier.com",
      "received": "2024-12-01 12:45",
      "size": "0.5 МБ",
      "category": "Invoices",
      "status": "Processing"
    }
  ],
  "providers": [
    {"name": "Gmail", "host": "imap.gmail.com", "port": 993, "secure": true},
    {"name": "Outlook", "host": "outlook.office365.com", "port": 993, "secure": true},
    {"name": "Yahoo", "host": "imap.mail.yahoo.com", "port": 993, "secure": true},
    {"name": "Other", "host": "", "port": 993, "secure": true}
  ],
  "activityLog": []
};

// Extended documents for the documents page
const allDocuments = [
  ...appData.recentDocuments,
  {
    "id": 4,
    "filename": "Product_Presentation.pptx",
    "sender": "marketing@company.com",
    "received": "2024-12-01 11:20",
    "size": "15.2 МБ",
    "category": "Presentations",
    "status": "Processed"
  },
  {
    "id": 5,
    "filename": "System_Backup.zip",
    "sender": "admin@company.com",
    "received": "2024-12-01 10:15",
    "size": "128.7 МБ",
    "category": "Archives",
    "status": "Processed"
  },
  {
    "id": 6,
    "filename": "Marketing_Strategy_2024.pptx",
    "sender": "marketing@company.com",
    "received": "2024-11-30 16:45",
    "size": "8.3 МБ",
    "category": "Presentations",
    "status": "Processed"
  },
  {
    "id": 7,
    "filename": "Employee_Handbook.pdf",
    "sender": "hr@company.com",
    "received": "2024-11-30 14:20",
    "size": "3.7 МБ",
    "category": "Other",
    "status": "Processed"
  },
  {
    "id": 8,
    "filename": "Product_Images.zip",
    "sender": "design@company.com",
    "received": "2024-11-30 11:15",
    "size": "45.2 МБ",
    "category": "Images",
    "status": "Processed"
  },
  {
    "id": 9,
    "filename": "Supplier_Invoice_SI-2024-045.pdf",
    "sender": "suppliers@vendor.com",
    "received": "2024-11-29 09:30",
    "size": "1.2 МБ",
    "category": "Invoices",
    "status": "Error"
  },
  {
    "id": 10,
    "filename": "Annual_Report_2023.pdf",
    "sender": "finance@company.com",
    "received": "2024-11-29 08:15",
    "size": "12.8 МБ",
    "category": "Reports",
    "status": "Processed"
  }
];

// Activity log data
const activityItems = [
  {
    id: 1,
    type: 'sync',
    icon: '🔄',
    text: 'Синхронизация аккаунта <strong>john.doe@company.com</strong> запущена',
    timestamp: new Date(new Date().getTime() - 25 * 60000)
  },
  {
    id: 2,
    type: 'document',
    icon: '📄',
    text: 'Документ <strong>Q4_Financial_Report.pdf</strong> обработан',
    timestamp: new Date(new Date().getTime() - 45 * 60000)
  },
  {
    id: 3,
    type: 'account',
    icon: '📧',
    text: 'Новый аккаунт <strong>support@service.net</strong> добавлен',
    timestamp: new Date(new Date().getTime() - 80 * 60000)
  },
  {
    id: 4,
    type: 'error',
    icon: '⚠️',
    text: 'Ошибка при обработке <strong>Supplier_Invoice_SI-2024-045.pdf</strong>',
    timestamp: new Date(new Date().getTime() - 110 * 60000)
  },
  {
    id: 5,
    type: 'document',
    icon: '📄',
    text: 'Документ <strong>Service_Contract_2024.docx</strong> обработан',
    timestamp: new Date(new Date().getTime() - 140 * 60000)
  }
];

// Application state
let currentPage = 'dashboard';
let uploadQueue = [];
let syncInProgress = false;
let selectedDocuments = new Set();
let accountSyncState = {
  1: false, // not syncing
  2: false,
  3: true  // syncing
};

// DOM Elements
const sidebarItems = document.querySelectorAll('.sidebar-item');
const pages = document.querySelectorAll('.page');
const modal = document.getElementById('add-account-modal');
const previewModal = document.getElementById('document-preview-modal');
const toastContainer = document.getElementById('toast-container');
const activityFeed = document.getElementById('activity-feed');
const syncStatusIndicator = document.querySelector('.status-indicator');
const syncStatusText = document.querySelector('.status-text');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    populateDashboard();
    populateAccounts();
    populateDocuments();
    initializeUpload();
    initializeModals();
    initializeSettings();
    initializeActivityFeed();
    initializeSyncControls();
    startRealTimeUpdates();
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

    // Update page visibility with smooth transition
    pages.forEach(pageElement => {
        if (pageElement.id === `${page}-page`) {
            pageElement.style.opacity = '0';
            pageElement.classList.remove('hidden');
            setTimeout(() => {
                pageElement.style.opacity = '1';
            }, 10);
        } else if (!pageElement.classList.contains('hidden')) {
            pageElement.style.opacity = '0';
            setTimeout(() => {
                pageElement.classList.add('hidden');
            }, 300);
        }
    });

    currentPage = page;
}

// Dashboard functionality
function populateDashboard() {
    // Update stats
    document.getElementById('total-documents').textContent = formatNumberWithCommas(appData.stats.totalDocuments);
    document.getElementById('active-accounts').textContent = appData.stats.activeAccounts;
    document.getElementById('errors-today').textContent = appData.stats.errorsToday;
    document.getElementById('storage-used').textContent = appData.stats.storageUsed;
    
    // Populate recent documents
    const recentDocumentsTbody = document.getElementById('recent-documents-tbody');
    recentDocumentsTbody.innerHTML = '';
    
    appData.recentDocuments.forEach(doc => {
        const row = createDocumentRow(doc, true);
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

function createDocumentRow(doc, isRecent = false) {
    const row = document.createElement('tr');
    const statusClass = doc.status.toLowerCase().replace(' ', '-');
    const statusTranslation = getStatusTranslation(doc.status);
    
    let actions = `
        <button class="table-action-btn preview-btn" data-id="${doc.id}" title="Просмотр">👁️</button>
        <button class="table-action-btn download-btn" data-id="${doc.id}" title="Скачать">⬇️</button>
        <button class="table-action-btn delete-btn" data-id="${doc.id}" title="Удалить">🗑️</button>
    `;
    
    if (isRecent) {
        row.innerHTML = `
            <td>${doc.filename}</td>
            <td>${doc.sender}</td>
            <td>${formatDate(doc.received)}</td>
            <td>${doc.size}</td>
            <td>${getCategoryTranslation(doc.category)}</td>
            <td><span class="status-badge ${statusClass}">${statusTranslation}</span></td>
            <td>${actions}</td>
        `;
    } else {
        row.innerHTML = `
            <td><input type="checkbox" class="doc-checkbox" data-id="${doc.id}"></td>
            <td>${doc.filename}</td>
            <td>${doc.sender}</td>
            <td>${formatDate(doc.received)}</td>
            <td>${doc.size}</td>
            <td>${getCategoryTranslation(doc.category)}</td>
            <td><span class="status-badge ${statusClass}">${statusTranslation}</span></td>
            <td>${actions}</td>
        `;
    }
    
    // Add event listeners to action buttons
    setTimeout(() => {
        const previewBtns = row.querySelectorAll('.preview-btn');
        const downloadBtns = row.querySelectorAll('.download-btn');
        const deleteBtns = row.querySelectorAll('.delete-btn');
        
        previewBtns.forEach(btn => {
            btn.addEventListener('click', () => previewDocument(doc.id));
        });
        
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', () => downloadDocument(doc.id));
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', () => deleteDocument(doc.id));
        });
        
        // For document checkboxes
        const checkboxes = row.querySelectorAll('.doc-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const docId = parseInt(e.target.dataset.id);
                if (e.target.checked) {
                    selectedDocuments.add(docId);
                } else {
                    selectedDocuments.delete(docId);
                }
                updateBulkActionButton();
            });
        });
    }, 0);
    
    return row;
}

function updateBulkActionButton() {
    const bulkBtn = document.getElementById('bulk-actions-btn');
    if (selectedDocuments.size > 0) {
        bulkBtn.textContent = `Выбрано: ${selectedDocuments.size}`;
        bulkBtn.classList.add('btn--primary');
        bulkBtn.classList.remove('btn--secondary');
    } else {
        bulkBtn.innerHTML = `<span>📋</span> Групповые действия`;
        bulkBtn.classList.remove('btn--primary');
        bulkBtn.classList.add('btn--secondary');
    }
}

function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    
    card.innerHTML = `
        <div class="icon">${category.icon}</div>
        <h4>${category.russianName}</h4>
        <div class="count">${formatNumberWithCommas(category.count)}</div>
    `;
    
    return card;
}

function getCategoryTranslation(category) {
    const categoryObj = appData.documentCategories.find(cat => cat.name === category);
    return categoryObj ? categoryObj.russianName : category;
}

function getStatusTranslation(status) {
    const statusMap = {
        'Processed': 'Обработан',
        'Processing': 'Обрабатывается',
        'Error': 'Ошибка',
        'Active': 'Активен',
        'Inactive': 'Неактивен',
        'Syncing': 'Синхронизация'
    };
    
    return statusMap[status] || status;
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
    const statusClass = account.status.toLowerCase();
    const statusTranslation = getStatusTranslation(account.status);
    
    card.innerHTML = `
        <div class="account-header">
            <div>
                <h3 class="account-email">${account.email}</h3>
                <p class="account-provider">${account.provider}</p>
            </div>
            <span class="account-badge ${statusClass}">${statusTranslation}</span>
        </div>
        <div class="account-info">
            <div>
                <span class="documents-count">${formatNumberWithCommas(account.totalProcessed)}</span> документов
            </div>
            <div>Последняя синхронизация: ${account.lastSync}</div>
        </div>
        <div class="account-actions">
            <button class="btn btn--secondary btn--sm sync-account-btn" data-id="${account.id}">
                <span>🔄</span> Синхронизировать
            </button>
            <button class="btn btn--outline btn--sm test-connection-btn" data-id="${account.id}">
                <span>🔌</span> Проверить соединение
            </button>
        </div>
    `;
    
    setTimeout(() => {
        const syncBtn = card.querySelector('.sync-account-btn');
        const testBtn = card.querySelector('.test-connection-btn');
        
        syncBtn.addEventListener('click', () => {
            syncAccount(account.id);
        });
        
        testBtn.addEventListener('click', () => {
            testConnection(account.id);
        });
    }, 0);
    
    return card;
}

// Documents functionality
function populateDocuments() {
    const documentsTbody = document.getElementById('documents-tbody');
    const searchInput = document.getElementById('search-documents');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const selectAllCheckbox = document.getElementById('select-all-docs');
    const bulkActionsBtn = document.getElementById('bulk-actions-btn');
    const exportBtn = document.getElementById('export-btn');
    
    function renderDocuments() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedStatus = statusFilter.value;
        
        const filteredDocuments = allDocuments.filter(doc => {
            const matchesSearch = doc.filename.toLowerCase().includes(searchTerm) ||
                                doc.sender.toLowerCase().includes(searchTerm);
            const matchesCategory = !selectedCategory || doc.category === selectedCategory;
            const matchesStatus = !selectedStatus || doc.status === selectedStatus;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        documentsTbody.innerHTML = '';
        filteredDocuments.forEach(doc => {
            const row = createDocumentRow(doc);
            documentsTbody.appendChild(row);
        });
        
        // Reset selected documents when filter changes
        selectedDocuments.clear();
        updateBulkActionButton();
        selectAllCheckbox.checked = false;
    }
    
    searchInput.addEventListener('input', renderDocuments);
    categoryFilter.addEventListener('change', renderDocuments);
    statusFilter.addEventListener('change', renderDocuments);
    
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = documentsTbody.querySelectorAll('.doc-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
            const docId = parseInt(checkbox.dataset.id);
            if (e.target.checked) {
                selectedDocuments.add(docId);
            } else {
                selectedDocuments.delete(docId);
            }
        });
        updateBulkActionButton();
    });
    
    bulkActionsBtn.addEventListener('click', () => {
        if (selectedDocuments.size > 0) {
            showBulkActions();
        }
    });
    
    exportBtn.addEventListener('click', () => {
        showToast('info', 'Экспорт', 'Подготовка документов для экспорта...');
        setTimeout(() => {
            showToast('success', 'Экспорт завершен', `${allDocuments.length} документов экспортировано успешно`);
        }, 1500);
    });
    
    // Initial render
    renderDocuments();
}

function showBulkActions() {
    const actions = ['Удалить', 'Категоризировать', 'Экспортировать'];
    const actionItems = actions.map(action => 
        `<button class="btn btn--secondary bulk-action-btn" data-action="${action.toLowerCase()}">${action}</button>`
    ).join('');
    
    showToast('info', 'Выбрано документов: ' + selectedDocuments.size, 
        `<div class="bulk-actions">${actionItems}</div>`, 
        10000);
        
    // Add event listeners
    setTimeout(() => {
        const bulkActionBtns = document.querySelectorAll('.bulk-action-btn');
        bulkActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                executeBulkAction(action);
            });
        });
    }, 0);
}

function executeBulkAction(action) {
    switch(action) {
        case 'удалить':
            showToast('info', 'Удаление', `Удаление ${selectedDocuments.size} документов...`);
            setTimeout(() => {
                showToast('success', 'Удаление завершено', `${selectedDocuments.size} документов удалено`);
                selectedDocuments.clear();
                populateDocuments();
            }, 1500);
            break;
        case 'категоризировать':
            showToast('info', 'Категоризация', 'Выбор категории...');
            // Implementation would involve showing a category selection UI
            break;
        case 'экспортировать':
            showToast('info', 'Экспорт', 'Подготовка выбранных документов...');
            setTimeout(() => {
                showToast('success', 'Экспорт завершен', `${selectedDocuments.size} документов экспортировано`);
            }, 1500);
            break;
    }
}

function previewDocument(id) {
    const doc = allDocuments.find(d => d.id === id);
    if (!doc) return;
    
    const previewContent = document.getElementById('document-preview');
    const previewTitle = document.getElementById('preview-title');
    
    previewTitle.textContent = doc.filename;
    
    // Determine file type from extension
    const extension = doc.filename.split('.').pop().toLowerCase();
    
    // Show appropriate preview based on file type
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div class="icon">🖼️</div>
                <p>Предварительный просмотр изображения</p>
                <p>${doc.filename}</p>
            </div>
        `;
    } else if (extension === 'pdf') {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div class="icon">📄</div>
                <p>Предварительный просмотр PDF</p>
                <p>${doc.filename}</p>
            </div>
        `;
    } else if (['docx', 'doc'].includes(extension)) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div class="icon">📝</div>
                <p>Предварительный просмотр документа Word</p>
                <p>${doc.filename}</p>
            </div>
        `;
    } else if (['pptx', 'ppt'].includes(extension)) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div class="icon">📑</div>
                <p>Предварительный просмотр презентации PowerPoint</p>
                <p>${doc.filename}</p>
            </div>
        `;
    } else if (['xlsx', 'xls'].includes(extension)) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div class="icon">📊</div>
                <p>Предварительный просмотр таблицы Excel</p>
                <p>${doc.filename}</p>
            </div>
        `;
    } else if (['zip', 'rar', '7z'].includes(extension)) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div class="icon">📦</div>
                <p>Предварительный просмотр архива</p>
                <p>${doc.filename}</p>
            </div>
        `;
    } else {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div class="icon">📁</div>
                <p>Предварительный просмотр недоступен</p>
                <p>${doc.filename}</p>
            </div>
        `;
    }
    
    // Show download and categorize buttons
    const downloadBtn = document.getElementById('download-document');
    const categorizeBtn = document.getElementById('categorize-document');
    
    downloadBtn.onclick = () => downloadDocument(doc.id);
    categorizeBtn.onclick = () => categorizeDocument(doc.id);
    
    // Show the modal
    previewModal.classList.remove('hidden');
}

function downloadDocument(id) {
    const doc = allDocuments.find(d => d.id === id);
    if (!doc) return;
    
    showToast('info', 'Скачивание', `Подготовка файла ${doc.filename}...`);
    
    setTimeout(() => {
        showToast('success', 'Скачивание завершено', `Файл ${doc.filename} скачан`);
    }, 1500);
}

function deleteDocument(id) {
    const doc = allDocuments.find(d => d.id === id);
    if (!doc) return;
    
    if (confirm(`Вы уверены, что хотите удалить "${doc.filename}"?`)) {
        showToast('info', 'Удаление', `Удаление файла ${doc.filename}...`);
        
        setTimeout(() => {
            // Remove document from array
            const index = allDocuments.findIndex(d => d.id === id);
            if (index !== -1) {
                allDocuments.splice(index, 1);
                
                // Update UI
                populateDocuments();
                if (currentPage === 'dashboard') {
                    populateDashboard();
                }
                
                // Update stats
                appData.stats.totalDocuments--;
                if (currentPage === 'dashboard') {
                    document.getElementById('total-documents').textContent = formatNumberWithCommas(appData.stats.totalDocuments);
                }
                
                // Add to activity log
                addActivityItem({
                    type: 'document',
                    icon: '🗑️',
                    text: `Документ <strong>${doc.filename}</strong> удален`,
                    timestamp: new Date()
                });
                
                showToast('success', 'Удаление завершено', `Файл ${doc.filename} удален`);
            }
        }, 1000);
    }
}

function categorizeDocument(id) {
    const doc = allDocuments.find(d => d.id === id);
    if (!doc) return;
    
    // In a real app, this would show a category selection UI
    showToast('info', 'Категоризация', `Выбор категории для ${doc.filename}...`);
    
    setTimeout(() => {
        // Simulate changing the category
        const randomCategory = appData.documentCategories[Math.floor(Math.random() * appData.documentCategories.length)];
        doc.category = randomCategory.name;
        
        // Update UI
        populateDocuments();
        if (currentPage === 'dashboard') {
            populateDashboard();
        }
        
        // Add to activity log
        addActivityItem({
            type: 'document',
            icon: '🏷️',
            text: `Документ <strong>${doc.filename}</strong> изменил категорию на <strong>${randomCategory.russianName}</strong>`,
            timestamp: new Date()
        });
        
        showToast('success', 'Категоризация завершена', `Файл ${doc.filename} отнесен к категории ${randomCategory.russianName}`);
        
        // Close the preview modal
        previewModal.classList.add('hidden');
    }, 1500);
}

// Upload functionality
function initializeUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const uploadItems = document.getElementById('upload-items');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    
    // Click to select files
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== selectFilesBtn) {
            fileInput.click();
        }
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
    
    // Clear completed uploads
    clearCompletedBtn.addEventListener('click', () => {
        const completed = uploadQueue.filter(item => item.progress === 100);
        if (completed.length > 0) {
            // Remove completed items from DOM
            completed.forEach(item => {
                const element = document.getElementById(`upload-${item.id}`);
                if (element) {
                    element.classList.add('fade-out');
                    setTimeout(() => {
                        if (element.parentNode) {
                            element.parentNode.removeChild(element);
                        }
                    }, 300);
                }
            });
            
            // Remove completed items from queue
            uploadQueue = uploadQueue.filter(item => item.progress < 100);
            
            showToast('success', 'Очистка', 'Завершенные загрузки удалены');
        }
    });
    
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showToast('error', 'Файл слишком большой', `${file.name} превышает лимит в 10МБ`);
                return;
            }
            
            // Check if file is already in queue
            const isDuplicate = uploadQueue.some(item => item.file.name === file.name && item.file.size === file.size && item.progress < 100);
            if (isDuplicate) {
                showToast('warning', 'Дубликат файла', `${file.name} уже добавлен в очередь загрузки`);
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
        
        // Add to activity log
        addActivityItem({
            type: 'upload',
            icon: '📤',
            text: `Файл <strong>${file.name}</strong> добавлен в очередь загрузки`,
            timestamp: new Date()
        });
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
            <div class="upload-action">
                <button class="table-action-btn cancel-upload-btn" title="Отменить">❌</button>
            </div>
        `;
        
        uploadItems.appendChild(uploadDiv);
        
        // Add cancel button functionality
        const cancelBtn = uploadDiv.querySelector('.cancel-upload-btn');
        cancelBtn.addEventListener('click', () => {
            // Remove from queue
            const index = uploadQueue.findIndex(i => i.id === item.id);
            if (index !== -1) {
                uploadQueue.splice(index, 1);
            }
            
            // Remove from DOM with animation
            uploadDiv.classList.add('fade-out');
            setTimeout(() => {
                if (uploadDiv.parentNode) {
                    uploadDiv.parentNode.removeChild(uploadDiv);
                }
            }, 300);
            
            showToast('info', 'Загрузка отменена', `Загрузка файла ${item.file.name} отменена`);
        });
    }
    
    function simulateUpload(item) {
        const interval = setInterval(() => {
            item.progress += Math.random() * 15;
            
            if (item.progress >= 100) {
                item.progress = 100;
                item.status = 'completed';
                clearInterval(interval);
                
                // Add to documents
                const newDoc = {
                    id: allDocuments.length + 1,
                    filename: item.file.name,
                    sender: 'manual@upload.local',
                    received: new Date().toISOString().replace('T', ' ').substr(0, 16),
                    size: formatFileSize(item.file.size),
                    category: determineCategory(item.file.name),
                    status: 'Processed'
                };
                
                allDocuments.unshift(newDoc);
                
                // Update app data
                appData.stats.totalDocuments++;
                const categoryIndex = appData.documentCategories.findIndex(cat => cat.name === newDoc.category);
                if (categoryIndex !== -1) {
                    appData.documentCategories[categoryIndex].count++;
                }
                
                // Update UI if on dashboard
                if (currentPage === 'dashboard') {
                    populateDashboard();
                }
                
                // Add to activity log
                addActivityItem({
                    type: 'document',
                    icon: '📥',
                    text: `Документ <strong>${item.file.name}</strong> успешно загружен и обработан`,
                    timestamp: new Date()
                });
                
                showToast('success', 'Загрузка завершена', `${item.file.name} успешно загружен`);
            }
            
            updateUploadProgress(item);
        }, 200);
    }
    
    function updateUploadProgress(item) {
        const element = document.getElementById(`upload-${item.id}`);
        if (element) {
            const progressFill = element.querySelector('.progress-fill');
            const statusElement = element.querySelector('.upload-status');
            const cancelBtn = element.querySelector('.cancel-upload-btn');
            
            progressFill.style.width = `${item.progress}%`;
            statusElement.textContent = item.progress >= 100 ? 'Завершено' : `${Math.round(item.progress)}%`;
            
            if (item.progress >= 100) {
                cancelBtn.title = 'Удалить';
                cancelBtn.textContent = '🗑️';
            }
        }
    }
    
    function determineCategory(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        
        const categoryMap = {
            'pdf': ['invoice', 'счет', 'report', 'отчет'].some(term => filename.toLowerCase().includes(term)) ? 'Invoices' : 'Reports',
            'docx': 'Contracts',
            'xlsx': 'Reports',
            'pptx': 'Presentations',
            'jpg': 'Images',
            'jpeg': 'Images',
            'png': 'Images',
            'zip': 'Archives',
            'rar': 'Archives'
        };
        
        return categoryMap[extension] || 'Other';
    }
}

// Modal functionality
function initializeModals() {
    // Add Account Modal
    const addAccountBtn = document.getElementById('add-account-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-add-account');
    const confirmBtn = document.getElementById('confirm-add-account');
    const form = document.getElementById('add-account-form');
    const providerSelect = document.getElementById('account-provider');
    const customSettings = document.getElementById('custom-settings');
    
    // Preview Modal
    const closePreviewBtn = document.getElementById('close-preview-modal');
    
    addAccountBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    closePreviewBtn.addEventListener('click', () => {
        previewModal.classList.add('hidden');
    });
    
    providerSelect.addEventListener('change', () => {
        if (providerSelect.value === 'Other') {
            customSettings.style.display = 'block';
        } else {
            customSettings.style.display = 'none';
        }
    });
    
    confirmBtn.addEventListener('click', () => {
        const email = document.getElementById('account-email').value;
        const provider = document.getElementById('account-provider').value;
        const password = document.getElementById('account-password').value;
        
        if (email && provider && password) {
            // Show loading state
            const btnText = confirmBtn.querySelector('.btn-text');
            const btnLoading = confirmBtn.querySelector('.btn-loading');
            
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            confirmBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Simulate adding account
                const newAccount = {
                    id: appData.emailAccounts.length + 1,
                    email: email,
                    provider: provider,
                    status: 'Active',
                    lastSync: 'Только что',
                    totalProcessed: 0
                };
                
                appData.emailAccounts.push(newAccount);
                appData.stats.activeAccounts++;
                
                // Update UI
                populateAccounts();
                if (currentPage === 'dashboard') {
                    document.getElementById('active-accounts').textContent = appData.stats.activeAccounts;
                }
                
                // Add to activity log
                addActivityItem({
                    type: 'account',
                    icon: '📧',
                    text: `Новый аккаунт <strong>${email}</strong> добавлен`,
                    timestamp: new Date()
                });
                
                // Reset button state
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
                confirmBtn.disabled = false;
                
                closeModal();
                form.reset();
                
                showToast('success', 'Аккаунт добавлен', `${email} успешно добавлен`);
            }, 1500);
        } else {
            showToast('error', 'Ошибка валидации', 'Пожалуйста, заполните все обязательные поля');
        }
    });
    
    // Close modals on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.classList.add('hidden');
        }
    });
    
    function closeModal() {
        modal.classList.add('hidden');
        form.reset();
        customSettings.style.display = 'none';
    }
}

// Settings functionality
function initializeSettings() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    const selects = document.querySelectorAll('#settings-page select');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const settingName = toggle.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const settingKey = toggle.id;
            const status = toggle.checked ? 'включен' : 'выключен';
            
            showToast('info', 'Настройка обновлена', `${getSettingTranslation(settingName)} ${status}`);
        });
    });
    
    selects.forEach(select => {
        select.addEventListener('change', () => {
            const settingName = select.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const value = select.options[select.selectedIndex].text;
            
            showToast('info', 'Настройка обновлена', `${getSettingTranslation(settingName)}: ${value}`);
        });
    });
}

function getSettingTranslation(setting) {
    const settingMap = {
        'Auto Processing': 'Автоматическая обработка',
        'Email Notifications': 'Email уведомления',
        'Error Notifications': 'Уведомления об ошибках',
        'Max File Size': 'Максимальный размер файла',
        'Storage Period': 'Период хранения',
        'Sync Interval': 'Интервал синхронизации'
    };
    
    return settingMap[setting] || setting;
}

// Sync controls functionality
function initializeSyncControls() {
    const syncAllBtn = document.getElementById('sync-all-btn');
    
    syncAllBtn.addEventListener('click', () => {
        if (syncInProgress) {
            showToast('warning', 'Синхронизация в процессе', 'Дождитесь завершения текущей синхронизации');
            return;
        }
        
        startSync();
    });
    
    updateSyncStatus();
}

function startSync() {
    syncInProgress = true;
    updateSyncStatus();
    
    showToast('info', 'Синхронизация началась', 'Начата синхронизация всех аккаунтов');
    
    // Add to activity log
    addActivityItem({
        type: 'sync',
        icon: '🔄',
        text: 'Синхронизация всех аккаунтов запущена',
        timestamp: new Date()
    });
    
    // Simulate sync for each account
    appData.emailAccounts.forEach((account, index) => {
        if (account.status !== 'Inactive') {
            setTimeout(() => {
                syncAccount(account.id, false);
            }, index * 1500);
        }
    });
    
    // Simulate sync completion
    setTimeout(() => {
        syncInProgress = false;
        updateSyncStatus();
        
        // Add to activity log
        addActivityItem({
            type: 'sync',
            icon: '✅',
            text: 'Синхронизация всех аккаунтов завершена',
            timestamp: new Date()
        });
        
        showToast('success', 'Синхронизация завершена', 'Все аккаунты синхронизированы');
    }, appData.emailAccounts.length * 1500 + 2000);
}

function syncAccount(id, showNotifications = true) {
    const account = appData.emailAccounts.find(acc => acc.id === id);
    if (!account || account.status === 'Syncing' || accountSyncState[id]) {
        if (showNotifications) {
            showToast('warning', 'Синхронизация уже идет', `Аккаунт ${account.email} уже синхронизируется`);
        }
        return;
    }
    
    // Update account status
    account.status = 'Syncing';
    accountSyncState[id] = true;
    
    // Update UI
    populateAccounts();
    
    if (showNotifications) {
        showToast('info', 'Синхронизация началась', `Начата синхронизация ${account.email}`);
    }
    
    // Add to activity log
    addActivityItem({
        type: 'sync',
        icon: '🔄',
        text: `Синхронизация аккаунта <strong>${account.email}</strong> запущена`,
        timestamp: new Date()
    });
    
    // Simulate fetching new documents
    setTimeout(() => {
        const documentsToAdd = Math.floor(Math.random() * 5) + 1; // 1-5 new documents
        
        for (let i = 0; i < documentsToAdd; i++) {
            const extensions = ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'zip'];
            const extension = extensions[Math.floor(Math.random() * extensions.length)];
            const filename = `Document_${Date.now()}_${i}.${extension}`;
            const category = determineCategory(filename);
            
            const newDoc = {
                id: allDocuments.length + 1,
                filename: filename,
                sender: account.email,
                received: new Date().toISOString().replace('T', ' ').substr(0, 16),
                size: `${(Math.random() * 10).toFixed(1)} МБ`,
                category: category,
                status: 'Processing'
            };
            
            allDocuments.unshift(newDoc);
            
            // Update app data
            appData.stats.totalDocuments++;
            const categoryIndex = appData.documentCategories.findIndex(cat => cat.name === category);
            if (categoryIndex !== -1) {
                appData.documentCategories[categoryIndex].count++;
            }
            account.totalProcessed++;
            
            // Add to activity log
            addActivityItem({
                type: 'document',
                icon: '📥',
                text: `Новый документ <strong>${filename}</strong> получен от <strong>${account.email}</strong>`,
                timestamp: new Date()
            });
            
            // Simulate processing completion after delay
            setTimeout(() => {
                newDoc.status = 'Processed';
                
                // Update UI if needed
                if (currentPage === 'dashboard') {
                    populateDashboard();
                } else if (currentPage === 'documents') {
                    populateDocuments();
                }
                
                // Add to activity log
                addActivityItem({
                    type: 'document',
                    icon: '✅',
                    text: `Документ <strong>${filename}</strong> обработан`,
                    timestamp: new Date()
                });
            }, (i + 1) * 1000);
        }
        
        // Reset account status
        setTimeout(() => {
            account.status = 'Active';
            account.lastSync = 'Только что';
            accountSyncState[id] = false;
            
            // Update UI
            populateAccounts();
            if (currentPage === 'dashboard') {
                populateDashboard();
                document.getElementById('total-documents').textContent = formatNumberWithCommas(appData.stats.totalDocuments);
            }
            
            if (showNotifications) {
                showToast('success', 'Синхронизация завершена', `Аккаунт ${account.email} синхронизирован, получено ${documentsToAdd} новых документов`);
            }
        }, documentsToAdd * 1000 + 500);
    }, 2000);
    
    function determineCategory(filename) {
        // Map file extensions to categories
        const extension = filename.split('.').pop().toLowerCase();
        
        const categoryMap = {
            'pdf': 'Reports',
            'docx': 'Contracts',
            'xlsx': 'Reports',
            'pptx': 'Presentations',
            'jpg': 'Images',
            'jpeg': 'Images',
            'png': 'Images',
            'zip': 'Archives',
            'rar': 'Archives'
        };
        
        return categoryMap[extension] || 'Other';
    }
}

function testConnection(id) {
    const account = appData.emailAccounts.find(acc => acc.id === id);
    if (!account) return;
    
    showToast('info', 'Проверка соединения', `Проверка соединения для ${account.email}...`);
    
    // Simulate API call
    setTimeout(() => {
        // 90% chance of success
        if (Math.random() < 0.9) {
            showToast('success', 'Проверка успешна', `Соединение с ${account.email} успешно установлено`);
        } else {
            showToast('error', 'Ошибка соединения', `Не удалось подключиться к ${account.email}. Проверьте учетные данные.`);
        }
    }, 1500);
}

function updateSyncStatus() {
    if (syncInProgress) {
        syncStatusIndicator.classList.add('syncing');
        syncStatusText.textContent = 'Синхронизация...';
    } else {
        syncStatusIndicator.classList.remove('syncing');
        
        // Check if any account is syncing
        const anySyncing = appData.emailAccounts.some(acc => acc.status === 'Syncing');
        if (anySyncing) {
            syncStatusIndicator.classList.add('syncing');
            syncStatusText.textContent = 'Синхронизация...';
        } else {
            syncStatusText.textContent = 'Готов';
        }
    }
}

// Activity Feed functionality
function initializeActivityFeed() {
    // Initially populate with existing activities
    activityItems.forEach(item => {
        renderActivityItem(item);
    });
}

function addActivityItem(item) {
    const newItem = {
        id: Date.now(),
        ...item
    };
    
    activityItems.unshift(newItem);
    
    // Keep only the last 20 items
    if (activityItems.length > 20) {
        activityItems.pop();
    }
    
    renderActivityItem(newItem, true);
}

function renderActivityItem(item, isNew = false) {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    if (isNew) {
        activityItem.style.opacity = '0';
    }
    
    activityItem.innerHTML = `
        <div class="activity-icon">${item.icon}</div>
        <div class="activity-content">
            <p class="activity-text">${item.text}</p>
            <p class="activity-time">${formatActivityTime(item.timestamp)}</p>
        </div>
    `;
    
    const activityFeed = document.getElementById('activity-feed');
    
    if (isNew) {
        activityFeed.prepend(activityItem);
        setTimeout(() => {
            activityItem.style.opacity = '1';
        }, 10);
    } else {
        activityFeed.appendChild(activityItem);
    }
}

// Real-time updates simulation
function startRealTimeUpdates() {
    // Update last sync times every minute
    setInterval(() => {
        appData.emailAccounts.forEach(account => {
            if (account.lastSync !== 'Только что') {
                const timeParts = account.lastSync.match(/(\d+)\s+(\w+)/);
                if (timeParts) {
                    let number = parseInt(timeParts[1]);
                    const unit = timeParts[2];
                    
                    if (unit.includes('минут')) {
                        number += 1;
                        account.lastSync = `${number} ${number === 1 ? 'минуту' : (number > 1 && number < 5 ? 'минуты' : 'минут')} назад`;
                    } else if (unit.includes('час')) {
                        account.lastSync = `${number + 1} ${(number + 1) === 1 ? 'час' : ((number + 1) > 1 && (number + 1) < 5 ? 'часа' : 'часов')} назад`;
                    }
                }
            }
        });
        
        // Update UI if on accounts page
        if (currentPage === 'accounts') {
            populateAccounts();
        }
    }, 60000);
    
    // Simulate random activity every 20-60 seconds
    setInterval(() => {
        if (Math.random() < 0.3) {
            generateRandomActivity();
        }
    }, 20000 + Math.random() * 40000);
    
    // Update activity timestamps
    setInterval(() => {
        updateActivityTimestamps();
    }, 60000);
}

function generateRandomActivity() {
    const activities = [
        {
            type: 'sync',
            icon: '🔄',
            text: 'Автоматическая синхронизация началась',
            action: () => {
                // Start syncing a random account
                const accountIds = appData.emailAccounts.map(acc => acc.id);
                const randomId = accountIds[Math.floor(Math.random() * accountIds.length)];
                syncAccount(randomId, false);
            }
        },
        {
            type: 'system',
            icon: '🔍',
            text: 'Запущено сканирование хранилища',
            action: () => {
                // No action needed, just informational
            }
        },
        {
            type: 'error',
            icon: '⚠️',
            text: 'Ошибка соединения с сервером',
            action: () => {
                appData.stats.errorsToday++;
                if (currentPage === 'dashboard') {
                    document.getElementById('errors-today').textContent = appData.stats.errorsToday;
                }
            }
        }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    addActivityItem({
        type: randomActivity.type,
        icon: randomActivity.icon,
        text: randomActivity.text,
        timestamp: new Date()
    });
    
    // Execute the action
    randomActivity.action();
}

function updateActivityTimestamps() {
    const timeElements = document.querySelectorAll('.activity-time');
    timeElements.forEach((el, index) => {
        if (index < activityItems.length) {
            el.textContent = formatActivityTime(activityItems[index].timestamp);
        }
    });
}

// Toast notification system
function showToast(type, title, message, duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <h4 class="toast-title">${title}</h4>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    toastContainer.appendChild(toast);
    
    // Auto remove after specified duration
    const timeoutId = setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    // Store the timeout ID on the toast element so we can clear it if manually closed
    toast.dataset.timeoutId = timeoutId;
}

function removeToast(toast) {
    if (toast && toast.parentNode) {
        // Clear the timeout to prevent multiple removal attempts
        if (toast.dataset.timeoutId) {
            clearTimeout(parseInt(toast.dataset.timeoutId));
        }
        
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
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatActivityTime(timestamp) {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 60000); // difference in minutes
    
    if (diff < 1) {
        return 'Только что';
    } else if (diff < 60) {
        return `${diff} ${getMinutesWord(diff)} назад`;
    } else if (diff < 1440) { // less than a day
        const hours = Math.floor(diff / 60);
        return `${hours} ${getHoursWord(hours)} назад`;
    } else {
        return timestamp.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function getMinutesWord(number) {
    if (number % 10 === 1 && number % 100 !== 11) {
        return 'минуту';
    } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return 'минуты';
    } else {
        return 'минут';
    }
}

function getHoursWord(number) {
    if (number % 10 === 1 && number % 100 !== 11) {
        return 'час';
    } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return 'часа';
    } else {
        return 'часов';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Байт';
    
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function determineCategory(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const categoryMap = {
        'pdf': ['invoice', 'счет', 'report', 'отчет'].some(term => filename.toLowerCase().includes(term)) ? 'Invoices' : 'Reports',
        'doc': 'Contracts',
        'docx': 'Contracts',
        'xlsx': 'Reports',
        'xls': 'Reports',
        'pptx': 'Presentations',
        'ppt': 'Presentations',
        'jpg': 'Images',
        'jpeg': 'Images',
        'png': 'Images',
        'gif': 'Images',
        'zip': 'Archives',
        'rar': 'Archives',
        '7z': 'Archives'
    };
    
    return categoryMap[extension] || 'Other';
}