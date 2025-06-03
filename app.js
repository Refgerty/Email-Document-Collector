// Email Document Collector App
class EmailDocumentCollector {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.documents = [];
        this.filteredDocuments = [];
        this.settings = {
            autoSyncInterval: 1800000, // 30 minutes
            maxFileSize: 50 * 1024 * 1024, // 50MB
            collectTypes: {
                pdf: true,
                word: true,
                excel: true,
                powerpoint: true,
                images: true,
                archives: true,
                other: true
            }
        };
        this.syncInterval = null;
        this.db = null;
        
        // Gmail API Configuration
        this.CLIENT_ID = '743528863942-um3hprot1s28ebcmt9td6vhvoh42id8e.apps.googleusercontent.com';
        this.API_KEY = 'demo_api_key';
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
        
        // File categories configuration
        this.fileCategories = {
            pdf: { name: "PDF Documents", icon: "📄", extensions: [".pdf"] },
            word: { name: "Word Documents", icon: "📝", extensions: [".doc", ".docx"] },
            excel: { name: "Excel Spreadsheets", icon: "📊", extensions: [".xls", ".xlsx"] },
            powerpoint: { name: "Presentations", icon: "📈", extensions: [".ppt", ".pptx"] },
            images: { name: "Images", icon: "🖼️", extensions: [".jpg", ".jpeg", ".png", ".gif", ".bmp"] },
            archives: { name: "Archives", icon: "🗜️", extensions: [".zip", ".rar", ".7z", ".tar"] },
            other: { name: "Other Files", icon: "📎", extensions: [] }
        };
        
        this.init();
    }

    async init() {
        try {
            await this.initDB();
            await this.loadSettings();
            await this.loadDocuments();
            this.initUI();
            this.initGoogleAPI();
            this.loadDemoData(); // Load demo data for testing
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Ошибка инициализации приложения', 'error');
        }
    }

    // IndexedDB Operations
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('EmailDocuments', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Documents store
                if (!db.objectStoreNames.contains('documents')) {
                    const documentsStore = db.createObjectStore('documents', { keyPath: 'id' });
                    documentsStore.createIndex('category', 'category', { unique: false });
                    documentsStore.createIndex('sender', 'sender', { unique: false });
                    documentsStore.createIndex('date', 'date', { unique: false });
                }
                
                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                // Sync history store
                if (!db.objectStoreNames.contains('sync_history')) {
                    db.createObjectStore('sync_history', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async saveDocument(document) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readwrite');
            const store = transaction.objectStore('documents');
            const request = store.put(document);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async loadDocuments() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.documents = request.result;
                this.filteredDocuments = [...this.documents];
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveSettings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key: 'app_settings', value: this.settings });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async loadSettings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('app_settings');
            
            request.onsuccess = () => {
                if (request.result) {
                    this.settings = { ...this.settings, ...request.result.value };
                }
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Google API Integration
    async initGoogleAPI() {
        try {
            await new Promise((resolve) => {
                gapi.load('auth2:client', resolve);
            });
            
            await gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: [this.DISCOVERY_DOC],
                scope: this.SCOPES
            });
            
            const authInstance = gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance.isSignedIn.get();
            
            if (this.isSignedIn) {
                this.currentUser = authInstance.currentUser.get();
                this.updateAuthUI();
            }
            
            authInstance.isSignedIn.listen(this.updateSigninStatus.bind(this));
            
        } catch (error) {
            console.error('Google API initialization error:', error);
            this.showToast('Ошибка подключения к Google API. Используется демо-режим.', 'warning');
        }
    }

    updateSigninStatus(isSignedIn) {
        this.isSignedIn = isSignedIn;
        if (isSignedIn) {
            this.currentUser = gapi.auth2.getAuthInstance().currentUser.get();
        } else {
            this.currentUser = null;
        }
        this.updateAuthUI();
    }

    async handleAuthClick() {
        try {
            if (this.isSignedIn) {
                await gapi.auth2.getAuthInstance().signOut();
                this.showToast('Отключен от Gmail', 'info');
            } else {
                await gapi.auth2.getAuthInstance().signIn();
                this.showToast('Подключен к Gmail', 'success');
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showToast('Ошибка авторизации. Используется демо-режим.', 'warning');
        }
    }

    updateAuthUI() {
        const authBtn = document.getElementById('auth-btn');
        const authStatus = document.getElementById('auth-status');
        const userEmail = document.getElementById('user-email');
        const syncBtn = document.getElementById('sync-btn');
        
        if (this.isSignedIn && this.currentUser) {
            const profile = this.currentUser.getBasicProfile();
            authBtn.textContent = 'Отключиться';
            authBtn.className = 'btn btn--outline';
            authStatus.classList.remove('hidden');
            authStatus.className = 'status status--success';
            userEmail.textContent = profile.getEmail();
            syncBtn.disabled = false;
        } else {
            authBtn.textContent = 'Connect Gmail';
            authBtn.className = 'btn btn--primary';
            authStatus.classList.add('hidden');
            syncBtn.disabled = true;
        }
    }

    // Document Processing
    async syncDocuments() {
        if (!this.isSignedIn) {
            this.showToast('Подключитесь к Gmail для синхронизации', 'warning');
            return;
        }

        const syncBtn = document.getElementById('sync-btn');
        const syncText = document.getElementById('sync-text');
        const progressContainer = document.getElementById('sync-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        try {
            syncBtn.disabled = true;
            syncText.textContent = 'Синхронизация...';
            progressContainer.classList.remove('hidden');
            
            // Search for emails with attachments
            progressText.textContent = 'Поиск писем с вложениями...';
            progressFill.style.width = '20%';

            const response = await gapi.client.gmail.users.messages.list({
                userId: 'me',
                q: 'has:attachment',
                maxResults: 50
            });

            if (!response.result.messages) {
                this.showToast('Письма с вложениями не найдены', 'info');
                return;
            }

            const messages = response.result.messages;
            progressText.textContent = `Обработка ${messages.length} писем...`;
            
            let processedCount = 0;
            let newDocuments = 0;

            for (let i = 0; i < messages.length; i++) {
                try {
                    const messageResponse = await gapi.client.gmail.users.messages.get({
                        userId: 'me',
                        id: messages[i].id
                    });

                    const message = messageResponse.result;
                    await this.processMessageAttachments(message);
                    
                    processedCount++;
                    const progress = 20 + (processedCount / messages.length) * 70;
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `Обработано ${processedCount}/${messages.length} писем`;
                    
                    // Small delay to prevent API rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }

            progressFill.style.width = '100%';
            progressText.textContent = 'Синхронизация завершена';
            
            await this.loadDocuments();
            this.updateDocumentsList();
            this.updateStats();
            
            this.showToast(`Синхронизация завершена. Найдено документов: ${newDocuments}`, 'success');
            
        } catch (error) {
            console.error('Sync error:', error);
            this.showToast('Ошибка синхронизации. Загружены демо-данные.', 'warning');
            this.loadDemoData();
        } finally {
            syncBtn.disabled = false;
            syncText.textContent = 'Синхронизировать';
            setTimeout(() => {
                progressContainer.classList.add('hidden');
                progressFill.style.width = '0%';
            }, 2000);
        }
    }

    async processMessageAttachments(message) {
        if (!message.payload || !message.payload.parts) return;

        const headers = message.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const date = new Date(parseInt(message.internalDate));

        for (const part of message.payload.parts) {
            if (part.filename && part.body && part.body.attachmentId) {
                try {
                    const category = this.categorizeFile(part.filename);
                    
                    if (!this.settings.collectTypes[category]) continue;
                    
                    const attachment = await gapi.client.gmail.users.messages.attachments.get({
                        userId: 'me',
                        messageId: message.id,
                        id: part.body.attachmentId
                    });

                    const documentData = {
                        id: `${message.id}_${part.body.attachmentId}`,
                        filename: part.filename,
                        category: category,
                        sender: from,
                        date: date.toISOString(),
                        size: part.body.size || 0,
                        subject: subject,
                        content: attachment.result.data
                    };

                    if (documentData.size <= this.settings.maxFileSize) {
                        await this.saveDocument(documentData);
                    }
                } catch (error) {
                    console.error('Error processing attachment:', error);
                }
            }
        }
    }

    categorizeFile(filename) {
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        
        for (const [category, config] of Object.entries(this.fileCategories)) {
            if (config.extensions.includes(extension)) {
                return category;
            }
        }
        
        return 'other';
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
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // UI Management
    initUI() {
        // Auth button
        document.getElementById('auth-btn').addEventListener('click', () => {
            this.handleAuthClick();
        });

        // Sync button
        document.getElementById('sync-btn').addEventListener('click', () => {
            this.syncDocuments();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterDocuments();
        });

        // Category filter
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filterDocuments();
        });

        // Settings modal
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettingsFromUI();
        });

        document.getElementById('clear-documents').addEventListener('click', () => {
            this.clearAllDocuments();
        });

        // Modal backdrop click to close
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal__backdrop')) {
                this.closeSettings();
            }
        });

        this.updateStats();
        this.updateDocumentsList();
        this.setupAutoSync();
    }

    filterDocuments() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;

        this.filteredDocuments = this.documents.filter(doc => {
            const matchesSearch = doc.filename.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || doc.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        this.updateDocumentsList();
    }

    updateDocumentsList() {
        const container = document.getElementById('documents-list');
        const noDocsRow = document.getElementById('no-documents');

        if (this.filteredDocuments.length === 0) {
            noDocsRow.style.display = 'table-row';
            // Clear existing rows except no-documents
            Array.from(container.children).forEach(row => {
                if (row.id !== 'no-documents') {
                    row.remove();
                }
            });
            return;
        }

        noDocsRow.style.display = 'none';

        // Clear existing rows except no-documents
        Array.from(container.children).forEach(row => {
            if (row.id !== 'no-documents') {
                row.remove();
            }
        });

        this.filteredDocuments.forEach(doc => {
            const row = this.createDocumentRow(doc);
            container.appendChild(row);
        });
    }

    createDocumentRow(doc) {
        const row = document.createElement('tr');
        row.className = 'document-row';
        
        const category = this.fileCategories[doc.category];
        
        row.innerHTML = `
            <td>
                <div class="document-filename">${doc.filename}</div>
            </td>
            <td>
                <div class="document-size">${this.formatFileSize(doc.size)}</div>
            </td>
            <td>
                <div class="document-date">${this.formatDate(doc.date)}</div>
            </td>
            <td>
                <div class="document-sender" title="${doc.sender}">${doc.sender}</div>
            </td>
            <td>
                <div class="document-category">
                    <span>${category.icon}</span>
                    <span>${category.name}</span>
                </div>
            </td>
            <td>
                <div class="document-actions">
                    <button class="btn btn--sm btn--outline" onclick="app.downloadDocument('${doc.id}')">
                        ⬇️ Скачать
                    </button>
                    <button class="btn btn--sm btn--outline" onclick="app.previewDocument('${doc.id}')">
                        👁️ Просмотр
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    async downloadDocument(docId) {
        try {
            const doc = this.documents.find(d => d.id === docId);
            if (!doc) return;

            // Create a simple text file for demo purposes since we don't have real content
            const content = `Demo file: ${doc.filename}\nSize: ${this.formatFileSize(doc.size)}\nFrom: ${doc.sender}\nDate: ${this.formatDate(doc.date)}`;
            const blob = new Blob([content], { type: 'text/plain' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast(`Файл ${doc.filename} загружен`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Ошибка загрузки файла', 'error');
        }
    }

    previewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        // Simple preview - just show document info
        this.showToast(`Превью: ${doc.filename} (${this.formatFileSize(doc.size)})`, 'info');
    }

    updateStats() {
        document.getElementById('total-docs').textContent = this.documents.length;
        
        const categories = new Set(this.documents.map(doc => doc.category));
        document.getElementById('categories-count').textContent = categories.size;
        
        // Update last sync time
        const lastSync = localStorage.getItem('lastSync');
        if (lastSync) {
            const date = new Date(lastSync);
            document.getElementById('last-sync').textContent = this.formatDate(date.toISOString());
        }
    }

    // Settings Management
    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('hidden');
        
        // Load current settings to UI
        document.getElementById('auto-sync-interval').value = this.settings.autoSyncInterval;
        document.getElementById('max-file-size').value = this.settings.maxFileSize / (1024 * 1024);
        
        Object.entries(this.settings.collectTypes).forEach(([type, enabled]) => {
            const checkbox = document.getElementById(`collect-${type}`);
            if (checkbox) checkbox.checked = enabled;
        });
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('hidden');
    }

    async saveSettingsFromUI() {
        this.settings.autoSyncInterval = parseInt(document.getElementById('auto-sync-interval').value);
        this.settings.maxFileSize = parseInt(document.getElementById('max-file-size').value) * 1024 * 1024;
        
        Object.keys(this.settings.collectTypes).forEach(type => {
            const checkbox = document.getElementById(`collect-${type}`);
            if (checkbox) {
                this.settings.collectTypes[type] = checkbox.checked;
            }
        });

        await this.saveSettings();
        this.setupAutoSync();
        this.closeSettings();
        this.showToast('Настройки сохранены', 'success');
    }

    async clearAllDocuments() {
        if (confirm('Вы уверены, что хотите удалить все документы?')) {
            try {
                const transaction = this.db.transaction(['documents'], 'readwrite');
                const store = transaction.objectStore('documents');
                await store.clear();
                
                this.documents = [];
                this.filteredDocuments = [];
                this.updateDocumentsList();
                this.updateStats();
                this.closeSettings();
                this.showToast('Все документы удалены', 'success');
            } catch (error) {
                console.error('Clear error:', error);
                this.showToast('Ошибка при удалении документов', 'error');
            }
        }
    }

    setupAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        if (this.settings.autoSyncInterval > 0) {
            this.syncInterval = setInterval(() => {
                if (this.isSignedIn) {
                    this.syncDocuments();
                }
            }, this.settings.autoSyncInterval);
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast__icon">${icons[type]}</div>
            <div class="toast__message">${message}</div>
            <button class="toast__close">✕</button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                container.removeChild(toast);
            }
        }, 5000);

        // Close button
        toast.querySelector('.toast__close').addEventListener('click', () => {
            if (toast.parentNode) {
                container.removeChild(toast);
            }
        });
    }

    // Demo Data for Testing
    loadDemoData() {
        const demoDocuments = [
            {
                id: "doc_1",
                filename: "invoice_2024_001.pdf",
                category: "pdf",
                sender: "billing@company.com",
                date: "2024-12-01T10:30:00Z",
                size: 245760,
                subject: "Invoice #2024-001",
                content: "demo_content_base64"
            },
            {
                id: "doc_2", 
                filename: "contract_renewal.docx",
                category: "word",
                sender: "legal@partner.com",
                date: "2024-11-28T14:15:00Z",
                size: 89234,
                subject: "Contract Renewal Documents",
                content: "demo_content_base64"
            },
            {
                id: "doc_3",
                filename: "sales_report_q4.xlsx",
                category: "excel", 
                sender: "analytics@company.com",
                date: "2024-11-25T09:45:00Z",
                size: 156890,
                subject: "Q4 Sales Analytics Report",
                content: "demo_content_base64"
            }
        ];

        // Only load demo data if no documents exist
        if (this.documents.length === 0) {
            this.documents = demoDocuments;
            this.filteredDocuments = [...this.documents];
            
            // Save demo documents to IndexedDB
            demoDocuments.forEach(doc => {
                this.saveDocument(doc);
            });
            
            this.updateDocumentsList();
            this.updateStats();
            localStorage.setItem('lastSync', new Date().toISOString());
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EmailDocumentCollector();
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.app) {
        window.app.showToast('Произошла ошибка приложения', 'error');
    }
});