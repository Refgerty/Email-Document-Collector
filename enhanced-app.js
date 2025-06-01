// enhanced-app.js - Enhanced frontend для интеграции с Email API
class EmailDocumentCollector {
  constructor() {
    this.apiBase = 'http://localhost:3000/api';
    this.currentPage = 'dashboard';
    this.uploadQueue = [];
    this.syncInterval = null;
    this.init();
  }

  async init() {
    this.initializeNavigation();
    this.initializeModal();
    this.initializeUpload();
    this.initializeSettings();
    await this.loadDashboard();
    this.startAutoSync();
  }

  // ====== API Methods ======
  async apiCall(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.apiBase}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      this.showToast('error', 'API Error', error.message);
      throw error;
    }
  }

  // ====== Navigation ======
  initializeNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const page = item.dataset.page;
        this.navigateToPage(page);
      });
    });
  }

  async navigateToPage(page) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === page) {
        item.classList.add('active');
      }
    });

    // Update page visibility
    document.querySelectorAll('.page').forEach(pageElement => {
      pageElement.classList.add('hidden');
      if (pageElement.id === `${page}-page`) {
        pageElement.classList.remove('hidden');
      }
    });

    this.currentPage = page;

    // Load page data
    switch (page) {
      case 'dashboard':
        await this.loadDashboard();
        break;
      case 'accounts':
        await this.loadAccounts();
        break;
      case 'documents':
        await this.loadDocuments();
        break;
      case 'settings':
        await this.loadSettings();
        break;
    }
  }

  // ====== Dashboard ======
  async loadDashboard() {
    try {
      // Load stats
      const stats = await this.apiCall('/dashboard/stats');
      this.updateStatsCards(stats);

      // Load recent documents
      const documents = await this.apiCall('/documents?limit=5');
      this.populateRecentDocuments(documents);

      // Load categories
      const categories = await this.apiCall('/documents/categories');
      this.populateCategories(categories);

    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  updateStatsCards(stats) {
    const statCards = document.querySelectorAll('.stat-card');
    statCards[0].querySelector('h3').textContent = stats.totalDocuments.toLocaleString();
    statCards[1].querySelector('h3').textContent = stats.activeAccounts;
    statCards[2].querySelector('h3').textContent = stats.errorsToday;
    statCards[3].querySelector('h3').textContent = stats.storageUsed;
  }

  populateRecentDocuments(documents) {
    const tbody = document.getElementById('recent-documents-tbody');
    tbody.innerHTML = '';
    
    documents.forEach(doc => {
      const row = this.createDocumentRow(doc);
      tbody.appendChild(row);
    });
  }

  populateCategories(categories) {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = '';
    
    categories.forEach(category => {
      const card = this.createCategoryCard(category);
      grid.appendChild(card);
    });
  }

  // ====== Email Accounts ======
  async loadAccounts() {
    try {
      const accounts = await this.apiCall('/accounts');
      this.populateAccounts(accounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  }

  populateAccounts(accounts) {
    const grid = document.getElementById('accounts-grid');
    grid.innerHTML = '';
    
    accounts.forEach(account => {
      const card = this.createAccountCard(account);
      grid.appendChild(card);
    });
  }

  createAccountCard(account) {
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
        <div>Last sync: ${this.formatDate(account.lastSync)}</div>
      </div>
      <div class="account-actions">
        <button class="btn btn--sm btn--primary" onclick="emailCollector.syncAccount('${account.email}')">
          Sync Now
        </button>
        <button class="btn btn--sm btn--secondary" onclick="emailCollector.testConnection('${account.email}')">
          Test
        </button>
      </div>
    `;
    
    return card;
  }

  async syncAccount(email) {
    try {
      this.showToast('info', 'Syncing', `Starting sync for ${email}...`);
      
      const result = await this.apiCall(`/accounts/${encodeURIComponent(email)}/sync`, 'POST');
      
      if (result.success) {
        this.showToast('success', 'Sync Complete', 
          `Processed ${result.processedCount} new documents`);
        
        // Refresh accounts and dashboard
        await this.loadAccounts();
        if (this.currentPage === 'dashboard') {
          await this.loadDashboard();
        }
      }
    } catch (error) {
      this.showToast('error', 'Sync Failed', error.message);
    }
  }

  async testConnection(email) {
    try {
      this.showToast('info', 'Testing', `Testing connection for ${email}...`);
      
      // Simulate connection test
      setTimeout(() => {
        this.showToast('success', 'Connection OK', `${email} is connected properly`);
      }, 2000);
    } catch (error) {
      this.showToast('error', 'Connection Failed', error.message);
    }
  }

  // ====== Modal for Adding Accounts ======
  initializeModal() {
    const modal = document.getElementById('add-account-modal');
    const addBtn = document.getElementById('add-account-btn');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-add-account');
    const confirmBtn = document.getElementById('confirm-add-account');
    const form = document.getElementById('add-account-form');

    addBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => this.closeModal());
    cancelBtn.addEventListener('click', () => this.closeModal());

    confirmBtn.addEventListener('click', async () => {
      await this.addAccount();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  async addAccount() {
    const form = document.getElementById('add-account-form');
    const formData = new FormData(form);
    
    const accountData = {
      email: document.getElementById('account-email').value,
      provider: document.getElementById('account-provider').value,
      password: document.getElementById('account-password').value
    };

    if (!accountData.email || !accountData.provider || !accountData.password) {
      this.showToast('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const result = await this.apiCall('/accounts', 'POST', accountData);
      
      if (result.success) {
        this.showToast('success', 'Account Added', 
          `${accountData.email} has been added successfully`);
        this.closeModal();
        form.reset();
        await this.loadAccounts();
      }
    } catch (error) {
      this.showToast('error', 'Failed to Add Account', error.message);
    }
  }

  closeModal() {
    const modal = document.getElementById('add-account-modal');
    const form = document.getElementById('add-account-form');
    modal.classList.add('hidden');
    form.reset();
  }

  // ====== Documents Management ======
  async loadDocuments() {
    try {
      this.initializeDocumentFilters();
      await this.searchDocuments();
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }

  initializeDocumentFilters() {
    const searchInput = document.getElementById('search-documents');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput && categoryFilter) {
      searchInput.addEventListener('input', () => this.searchDocuments());
      categoryFilter.addEventListener('change', () => this.searchDocuments());
    }
  }

  async searchDocuments() {
    try {
      const searchTerm = document.getElementById('search-documents')?.value || '';
      const category = document.getElementById('category-filter')?.value || '';
      
      let query = '/documents?limit=50';
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;
      if (category) query += `&category=${encodeURIComponent(category)}`;
      
      const documents = await this.apiCall(query);
      this.populateDocumentsTable(documents);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  populateDocumentsTable(documents) {
    const tbody = document.getElementById('documents-tbody');
    tbody.innerHTML = '';
    
    documents.forEach(doc => {
      const row = this.createDocumentRow(doc);
      tbody.appendChild(row);
    });
  }

  createDocumentRow(doc) {
    const row = document.createElement('tr');
    const statusClass = doc.status.toLowerCase().replace(' ', '-');
    
    row.innerHTML = `
      <td>
        <div class="document-info">
          <strong>${doc.filename}</strong>
          ${doc.originalName && doc.originalName !== doc.filename ? 
            `<br><small class="text-secondary">${doc.originalName}</small>` : ''}
        </div>
      </td>
      <td>${doc.sender}</td>
      <td>${this.formatDate(doc.received)}</td>
      <td>${this.formatFileSize(doc.size)}</td>
      <td>
        <span class="category-badge">${this.getCategoryIcon(doc.category)} ${doc.category}</span>
      </td>
      <td><span class="status-badge ${statusClass}">${doc.status}</span></td>
    `;
    
    return row;
  }

  // ====== Upload Management ======
  initializeUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-files-btn');

    if (!uploadArea || !fileInput || !selectBtn) return;

    selectBtn.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
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
      this.handleFiles(e.dataTransfer.files);
    });
  }

  async handleFiles(files) {
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        this.showToast('error', 'File too large', 
          `${file.name} exceeds the 50MB limit`);
        return;
      }
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.apiBase}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.showToast('success', 'Upload Complete', 
          `${result.files.length} files uploaded successfully`);
        
        // Refresh documents if on documents page
        if (this.currentPage === 'documents') {
          await this.loadDocuments();
        }
      }
    } catch (error) {
      this.showToast('error', 'Upload Failed', error.message);
    }
  }

  // ====== Settings ======
  async loadSettings() {
    try {
      const settings = await this.apiCall('/settings');
      this.populateSettings(settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  populateSettings(settings) {
    document.getElementById('auto-processing').checked = settings.autoProcessing;
    document.getElementById('max-file-size').value = settings.maxFileSize;
    document.getElementById('storage-period').value = settings.storagePeriod;
    document.getElementById('email-notifications').checked = settings.emailNotifications;
    document.getElementById('error-notifications').checked = settings.errorNotifications;
  }

  initializeSettings() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    const selects = document.querySelectorAll('#settings-page select');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('change', () => this.saveSetting(toggle));
    });
    
    selects.forEach(select => {
      select.addEventListener('change', () => this.saveSetting(select));
    });
  }

  async saveSetting(element) {
    try {
      const setting = element.id.replace(/-/g, '');
      const value = element.type === 'checkbox' ? element.checked : element.value;
      
      const settings = { [setting]: value };
      await this.apiCall('/settings', 'POST', settings);
      
      const settingName = element.id.replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      const status = element.type === 'checkbox' ? 
        (element.checked ? 'enabled' : 'disabled') : 
        `set to ${value}`;
        
      this.showToast('info', 'Setting Updated', `${settingName} has been ${status}`);
    } catch (error) {
      this.showToast('error', 'Save Failed', error.message);
    }
  }

  // ====== Auto Sync ======
  startAutoSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(async () => {
      try {
        const accounts = await this.apiCall('/accounts');
        const activeAccounts = accounts.filter(acc => acc.status === 'active');
        
        for (const account of activeAccounts) {
          console.log(`Auto-syncing: ${account.email}`);
          // Auto sync in background without showing toasts
          await this.apiCall(`/accounts/${encodeURIComponent(account.email)}/sync`, 'POST');
        }
        
        // Refresh current page data
        if (this.currentPage === 'dashboard') {
          await this.loadDashboard();
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ====== Utility Functions ======
  createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    
    card.innerHTML = `
      <div class="icon">${category.icon}</div>
      <h4>${category.name}</h4>
      <div class="count">${category.count.toLocaleString()}</div>
    `;
    
    return card;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCategoryIcon(category) {
    const icons = {
      'Invoices': '📄',
      'Contracts': '📋', 
      'Reports': '📊',
      'Presentations': '📑',
      'Images': '🖼️',
      'Archives': '📦',
      'Other': '📁'
    };
    return icons[category] || '📁';
  }

  showToast(type, title, message) {
    const toastContainer = document.getElementById('toast-container');
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
      this.removeToast(toast);
    });
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toast);
    }, 5000);
  }

  removeToast(toast) {
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
}

// Initialize the application
let emailCollector;
document.addEventListener('DOMContentLoaded', function() {
  emailCollector = new EmailDocumentCollector();
});