// Email Document Collector - JavaScript функциональность

// Данные приложения
const appData = {
  emailAccounts: [
    {
      id: 1,
      email: "office@company.ru",
      provider: "Gmail",
      status: "Активный",
      last_sync: "2025-06-01 18:30:00",
      total_processed: 1247
    },
    {
      id: 2,
      email: "support@business.com",
      provider: "Outlook",
      status: "Активный", 
      last_sync: "2025-06-01 18:45:00",
      total_processed: 892
    },
    {
      id: 3,
      email: "hr@corporation.de",
      provider: "Yahoo",
      status: "Ошибка",
      last_sync: "2025-06-01 17:20:00",
      total_processed: 543
    }
  ],
  documentCategories: [
    {"name": "Счета-фактуры", "count": 456, "icon": "📄"},
    {"name": "Договоры", "count": 234, "icon": "📋"},
    {"name": "Отчёты", "count": 189, "icon": "📊"},
    {"name": "Презентации", "count": 123, "icon": "📑"},
    {"name": "Изображения", "count": 567, "icon": "🖼️"},
    {"name": "Архивы", "count": 89, "icon": "📦"},
    {"name": "Другие", "count": 156, "icon": "📁"}
  ],
  recentDocuments: [
    {
      id: 1,
      filename: "Счёт-фактура_2025_001.pdf",
      sender: "accounting@supplier.com",
      received: "2025-06-01 18:35:00",
      size: "1.2 MB",
      category: "Счета-фактуры",
      status: "Обработан"
    },
    {
      id: 2,
      filename: "Договор_аренды_офиса.docx",
      sender: "realty@office.com",
      received: "2025-06-01 18:20:00",
      size: "856 KB",
      category: "Договоры",
      status: "Обработан"
    },
    {
      id: 3,
      filename: "Месячный_отчёт_май.xlsx",
      sender: "manager@department.ru",
      received: "2025-06-01 17:55:00",
      size: "2.4 MB",
      category: "Отчёты",
      status: "В обработке"
    },
    {
      id: 4,
      filename: "Презентация_проекта.pptx",
      sender: "team@projects.com",
      received: "2025-06-01 17:30:00",
      size: "5.8 MB",
      category: "Презентации",
      status: "Обработан"
    },
    {
      id: 5,
      filename: "Логотип_компании.png",
      sender: "design@creative.com",
      received: "2025-06-01 17:15:00",
      size: "234 KB",
      category: "Изображения",
      status: "Обработан"
    }
  ]
};

// Класс для управления приложением
class EmailDocumentCollector {
  constructor() {
    this.currentSection = 'dashboard';
    this.uploadedFiles = [];
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupModal();
    this.setupUpload();
    this.setupSearch();
    this.setupNotifications();
    this.renderDashboard();
    this.renderAccounts();
    this.renderDocuments();
    this.renderCategories();
  }

  // Навигация
  setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        
        // Обновляем активные элементы
        menuItems.forEach(mi => mi.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        item.classList.add('active');
        document.getElementById(section).classList.add('active');
        
        this.currentSection = section;
        
        // Эффект для активного элемента
        item.style.transform = 'scale(1.05)';
        setTimeout(() => {
          item.style.transform = '';
        }, 200);
      });
    });
  }

  // Модальные окна
  setupModal() {
    const addAccountBtn = document.getElementById('addAccountBtn');
    const modal = document.getElementById('addAccountModal');
    const closeModal = document.getElementById('closeModal');
    const cancelModal = document.getElementById('cancelModal');
    const addAccountForm = document.getElementById('addAccountForm');

    addAccountBtn.addEventListener('click', () => {
      modal.classList.add('show');
    });

    const closeModalHandler = () => {
      modal.classList.remove('show');
    };

    closeModal.addEventListener('click', closeModalHandler);
    cancelModal.addEventListener('click', closeModalHandler);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModalHandler();
      }
    });

    addAccountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(addAccountForm);
      const email = formData.get('email') || addAccountForm.querySelector('input[type="email"]').value;
      
      this.addEmailAccount(email);
      this.showNotification('Успех', `Email-аккаунт ${email} успешно добавлен`, 'success');
      closeModalHandler();
      addAccountForm.reset();
    });
  }

  // Загрузка файлов
  setupUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadQueue = document.getElementById('uploadQueue');
    const uploadList = document.getElementById('uploadList');

    // Клик для выбора файлов
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });
  }

  handleFiles(files) {
    const uploadQueue = document.getElementById('uploadQueue');
    const uploadList = document.getElementById('uploadList');
    
    if (files.length > 0) {
      uploadQueue.style.display = 'block';
    }

    Array.from(files).forEach(file => {
      const uploadItem = this.createUploadItem(file);
      uploadList.appendChild(uploadItem);
      this.simulateUpload(uploadItem, file);
    });
  }

  createUploadItem(file) {
    const item = document.createElement('div');
    item.className = 'upload-item';
    
    item.innerHTML = `
      <div class="upload-item-info">
        <div class="upload-item-name">${file.name}</div>
        <div class="upload-item-size">${this.formatFileSize(file.size)}</div>
      </div>
      <div class="upload-progress">
        <div class="upload-progress-bar" style="width: 0%"></div>
      </div>
      <div class="upload-status">0%</div>
    `;
    
    return item;
  }

  simulateUpload(uploadItem, file) {
    const progressBar = uploadItem.querySelector('.upload-progress-bar');
    const statusText = uploadItem.querySelector('.upload-status');
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        statusText.textContent = 'Завершено';
        this.showNotification('Загрузка', `Файл ${file.name} успешно загружен`, 'success');
        
        // Добавляем в список документов
        this.addDocument(file);
      } else {
        statusText.textContent = Math.round(progress) + '%';
      }
      
      progressBar.style.width = progress + '%';
    }, 100 + Math.random() * 200);
  }

  // Поиск и фильтрация
  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.filterDocuments();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.filterDocuments();
      });

      // Заполняем фильтр категориями
      appData.documentCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
      });
    }
  }

  filterDocuments() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedCategory = document.getElementById('categoryFilter')?.value || '';
    
    const rows = document.querySelectorAll('#documentsTableBody tr');
    
    rows.forEach(row => {
      const filename = row.querySelector('.document-filename')?.textContent.toLowerCase() || '';
      const category = row.cells[4]?.textContent || '';
      
      const matchesSearch = filename.includes(searchTerm);
      const matchesCategory = !selectedCategory || category === selectedCategory;
      
      if (matchesSearch && matchesCategory) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // Система уведомлений
  setupNotifications() {
    this.notificationContainer = document.getElementById('notifications');
  }

  showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-text">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    this.notificationContainer.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Закрытие уведомления
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.closeNotification(notification);
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
      this.closeNotification(notification);
    }, 5000);
  }

  closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Рендеринг дашборда
  renderDashboard() {
    this.renderDashboardDocuments();
    this.renderDashboardCategories();
  }

  renderDashboardDocuments() {
    const container = document.getElementById('dashboardDocuments');
    if (!container) return;

    const recentDocs = appData.recentDocuments.slice(0, 5);
    
    container.innerHTML = recentDocs.map(doc => `
      <div class="recent-document-item">
        <div class="recent-document-info">
          <div class="recent-document-name">${doc.filename}</div>
          <div class="recent-document-meta">${doc.sender} • ${this.formatDate(doc.received)}</div>
        </div>
        <div class="document-status ${this.getStatusClass(doc.status)}">${doc.status}</div>
      </div>
    `).join('');
  }

  renderDashboardCategories() {
    const container = document.getElementById('dashboardCategories');
    if (!container) return;

    const topCategories = appData.documentCategories
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    container.innerHTML = topCategories.map(category => `
      <div class="category-stat-item">
        <div class="category-stat-name">${category.icon} ${category.name}</div>
        <div class="category-stat-count">${category.count}</div>
      </div>
    `).join('');
  }

  // Рендеринг аккаунтов
  renderAccounts() {
    const container = document.getElementById('accountsGrid');
    if (!container) return;

    container.innerHTML = appData.emailAccounts.map(account => `
      <div class="account-card">
        <div class="account-header">
          <div class="account-email">${account.email}</div>
          <div class="account-status ${account.status === 'Активный' ? 'active' : 'error'}">${account.status}</div>
        </div>
        <div class="account-details">
          <div class="account-detail">
            <div class="account-detail-value">${account.provider}</div>
            <div class="account-detail-label">Провайдер</div>
          </div>
          <div class="account-detail">
            <div class="account-detail-value">${account.total_processed}</div>
            <div class="account-detail-label">Обработано</div>
          </div>
          <div class="account-detail">
            <div class="account-detail-value">${this.formatDate(account.last_sync)}</div>
            <div class="account-detail-label">Последняя синхронизация</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Рендеринг категорий
  renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    container.innerHTML = appData.documentCategories.map(category => `
      <div class="category-card" data-category="${category.name}">
        <div class="category-icon">${category.icon}</div>
        <div class="category-name">${category.name}</div>
        <div class="category-count">${category.count}</div>
      </div>
    `).join('');

    // Добавляем обработчик клика для фильтрации
    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
          categoryFilter.value = category;
          this.filterDocuments();
        }
        
        // Анимация клика
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      });
    });
  }

  // Рендеринг документов
  renderDocuments() {
    const container = document.getElementById('documentsTableBody');
    if (!container) return;

    container.innerHTML = appData.recentDocuments.map(doc => `
      <tr>
        <td><span class="document-filename">${doc.filename}</span></td>
        <td>${doc.sender}</td>
        <td>${this.formatDate(doc.received)}</td>
        <td>${doc.size}</td>
        <td>${doc.category}</td>
        <td><span class="document-status ${this.getStatusClass(doc.status)}">${doc.status}</span></td>
      </tr>
    `).join('');
  }

  // Добавление нового аккаунта
  addEmailAccount(email) {
    const newAccount = {
      id: appData.emailAccounts.length + 1,
      email: email,
      provider: this.detectProvider(email),
      status: 'Активный',
      last_sync: new Date().toISOString().slice(0, 19).replace('T', ' '),
      total_processed: 0
    };

    appData.emailAccounts.push(newAccount);
    this.renderAccounts();
  }

  // Добавление нового документа
  addDocument(file) {
    const newDoc = {
      id: appData.recentDocuments.length + 1,
      filename: file.name,
      sender: 'upload@system.local',
      received: new Date().toISOString().slice(0, 19).replace('T', ' '),
      size: this.formatFileSize(file.size),
      category: this.detectCategory(file.name),
      status: 'Обработан'
    };

    appData.recentDocuments.unshift(newDoc);
    
    // Ограничиваем список до 50 документов
    if (appData.recentDocuments.length > 50) {
      appData.recentDocuments = appData.recentDocuments.slice(0, 50);
    }

    this.renderDocuments();
    this.renderDashboard();
  }

  // Вспомогательные функции
  detectProvider(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain?.includes('gmail')) return 'Gmail';
    if (domain?.includes('outlook') || domain?.includes('hotmail')) return 'Outlook';
    if (domain?.includes('yahoo')) return 'Yahoo';
    return 'Другой';
  }

  detectCategory(filename) {
    const name = filename.toLowerCase();
    if (name.includes('счет') || name.includes('invoice')) return 'Счета-фактуры';
    if (name.includes('договор') || name.includes('contract')) return 'Договоры';
    if (name.includes('отчет') || name.includes('report')) return 'Отчёты';
    if (name.includes('презентация') || name.includes('presentation') || name.includes('.ppt')) return 'Презентации';
    if (name.includes('.png') || name.includes('.jpg') || name.includes('.jpeg') || name.includes('.gif')) return 'Изображения';
    if (name.includes('.zip') || name.includes('.rar') || name.includes('.7z')) return 'Архивы';
    return 'Другие';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status) {
    switch (status) {
      case 'Обработан': return 'processed';
      case 'В обработке': return 'processing';
      case 'Ошибка': return 'error';
      default: return 'processed';
    }
  }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const app = new EmailDocumentCollector();
  
  // Показываем приветственное уведомление
  setTimeout(() => {
    app.showNotification(
      'Добро пожаловать!', 
      'Email Document Collector готов к работе', 
      'success'
    );
  }, 1000);

  // Симуляция периодических обновлений
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% вероятность
      const messages = [
        'Новый документ обработан',
        'Синхронизация email завершена',
        'Система работает в штатном режиме'
      ];
      const message = messages[Math.floor(Math.random() * messages.length)];
      app.showNotification('Система', message, 'info');
    }
  }, 30000); // Каждые 30 секунд
});