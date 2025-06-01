// server.js - Backend server для Email Document Collector
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { ImapFlow } = require('imapflow');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Конфигурация хранилища для загруженных файлов
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB лимит
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла'));
    }
  }
});

// Класс для работы с Email API
class EmailConnector {
  constructor() {
    this.connections = new Map();
    this.webhookSecret = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
  }

  // Gmail API интеграция
  async connectGmail(credentials) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      oauth2Client.setCredentials({
        refresh_token: credentials.refreshToken
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      this.connections.set(credentials.email, {
        type: 'gmail',
        client: gmail,
        email: credentials.email,
        status: 'active'
      });

      return { success: true, message: 'Gmail подключен успешно' };
    } catch (error) {
      console.error('Ошибка подключения Gmail:', error);
      return { success: false, error: error.message };
    }
  }

  // IMAP интеграция (для Yahoo, Outlook и других)
  async connectIMAP(credentials) {
    try {
      const client = new ImapFlow({
        host: credentials.host,
        port: credentials.port,
        secure: credentials.secure,
        auth: {
          user: credentials.email,
          pass: credentials.password
        }
      });

      await client.connect();
      
      this.connections.set(credentials.email, {
        type: 'imap',
        client: client,
        email: credentials.email,
        credentials: credentials,
        status: 'active'
      });

      return { success: true, message: 'IMAP подключен успешно' };
    } catch (error) {
      console.error('Ошибка подключения IMAP:', error);
      return { success: false, error: error.message };
    }
  }

  // Получение новых сообщений с вложениями
  async fetchNewEmails(email) {
    const connection = this.connections.get(email);
    if (!connection) {
      throw new Error('Соединение не найдено');
    }

    if (connection.type === 'gmail') {
      return await this.fetchGmailEmails(connection);
    } else if (connection.type === 'imap') {
      return await this.fetchIMAPEmails(connection);
    }
  }

  async fetchGmailEmails(connection) {
    try {
      const response = await connection.client.users.messages.list({
        userId: 'me',
        q: 'has:attachment -in:sent',
        maxResults: 10
      });

      const messages = response.data.messages || [];
      const emails = [];

      for (const message of messages) {
        const email = await this.processGmailMessage(connection.client, message.id);
        if (email) emails.push(email);
      }

      return emails;
    } catch (error) {
      console.error('Ошибка получения Gmail сообщений:', error);
      throw error;
    }
  }

  async processGmailMessage(gmail, messageId) {
    try {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const headers = message.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'Без темы';
      const from = headers.find(h => h.name === 'From')?.value || 'Неизвестный отправитель';
      const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

      const attachments = await this.extractGmailAttachments(gmail, message.data);

      return {
        id: messageId,
        subject,
        from,
        date,
        attachments,
        source: 'gmail'
      };
    } catch (error) {
      console.error('Ошибка обработки Gmail сообщения:', error);
      return null;
    }
  }

  async extractGmailAttachments(gmail, message) {
    const attachments = [];

    const extractParts = (parts) => {
      if (!parts) return;

      for (const part of parts) {
        if (part.filename && part.body && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId
          });
        }

        if (part.parts) {
          extractParts(part.parts);
        }
      }
    };

    extractParts([message.payload]);
    return attachments;
  }

  async fetchIMAPEmails(connection) {
    try {
      const client = connection.client;
      let lock = await client.getMailboxLock('INBOX');
      
      try {
        const messages = [];
        
        // Получаем последние 10 сообщений с вложениями
        for await (let message of client.fetch('1:10', { 
          envelope: true, 
          bodystructure: true,
          source: true 
        })) {
          const attachments = this.findAttachments(message.bodyStructure);
          
          if (attachments.length > 0) {
            messages.push({
              id: message.uid,
              subject: message.envelope.subject || 'Без темы',
              from: message.envelope.from?.[0]?.address || 'Неизвестный отправитель',
              date: message.envelope.date || new Date(),
              attachments: attachments,
              source: 'imap'
            });
          }
        }

        return messages;
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Ошибка получения IMAP сообщений:', error);
      throw error;
    }
  }

  findAttachments(struct, attachments = []) {
    if (Array.isArray(struct)) {
      struct.forEach(item => this.findAttachments(item, attachments));
    } else if (struct.disposition && 
               ['attachment', 'inline'].includes(struct.disposition.type.toLowerCase())) {
      attachments.push({
        filename: struct.disposition.params?.filename || 'attachment',
        mimeType: struct.type + '/' + struct.subtype,
        size: struct.size || 0,
        partId: struct.part || '1'
      });
    } else if (struct.parts) {
      this.findAttachments(struct.parts, attachments);
    }

    return attachments;
  }

  // Загрузка вложения
  async downloadAttachment(email, messageId, attachmentData) {
    const connection = this.connections.get(email);
    if (!connection) {
      throw new Error('Соединение не найдено');
    }

    if (connection.type === 'gmail') {
      return await this.downloadGmailAttachment(connection, messageId, attachmentData);
    } else if (connection.type === 'imap') {
      return await this.downloadIMAPAttachment(connection, messageId, attachmentData);
    }
  }

  async downloadGmailAttachment(connection, messageId, attachmentData) {
    try {
      const attachment = await connection.client.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachmentData.attachmentId
      });

      const buffer = Buffer.from(attachment.data.data, 'base64');
      const filename = `${Date.now()}-${attachmentData.filename}`;
      const filepath = path.join('./uploads', filename);

      await fs.writeFile(filepath, buffer);

      return {
        filename: attachmentData.filename,
        filepath: filepath,
        size: buffer.length,
        mimeType: attachmentData.mimeType
      };
    } catch (error) {
      console.error('Ошибка загрузки Gmail вложения:', error);
      throw error;
    }
  }

  async downloadIMAPAttachment(connection, messageId, attachmentData) {
    try {
      const client = connection.client;
      let lock = await client.getMailboxLock('INBOX');

      try {
        const message = await client.fetchOne(messageId, {
          bodyParts: [attachmentData.partId]
        });

        const content = message.bodyParts.get(attachmentData.partId);
        const filename = `${Date.now()}-${attachmentData.filename}`;
        const filepath = path.join('./uploads', filename);

        await fs.writeFile(filepath, content);

        return {
          filename: attachmentData.filename,
          filepath: filepath,
          size: content.length,
          mimeType: attachmentData.mimeType
        };
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Ошибка загрузки IMAP вложения:', error);
      throw error;
    }
  }
}

// Инициализация Email Connector
const emailConnector = new EmailConnector();

// Хранилище данных (в реальном проекте использовать базу данных)
let documentsDB = [];
let accountsDB = [];
let settingsDB = {
  autoProcessing: true,
  maxFileSize: 10,
  storagePeriod: 24,
  emailNotifications: true,
  errorNotifications: true
};

// API Routes

// Получение статистики дашборда
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = {
      totalDocuments: documentsDB.length,
      activeAccounts: accountsDB.filter(acc => acc.status === 'active').length,
      errorsToday: Math.floor(Math.random() * 5), // Симуляция
      storageUsed: '45.7 GB' // Симуляция
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Управление email аккаунтами
app.post('/api/accounts', async (req, res) => {
  try {
    const { email, provider, password, host, port, secure } = req.body;

    let result;
    if (provider === 'Gmail') {
      // Для Gmail требуется OAuth 2.0
      result = { success: false, error: 'Gmail требует OAuth 2.0 настройки' };
    } else {
      // Попытка подключения через IMAP
      const imapConfig = {
        email,
        password,
        host: host || getDefaultHost(provider),
        port: port || (secure ? 993 : 143),
        secure: secure !== false
      };

      result = await emailConnector.connectIMAP(imapConfig);
    }

    if (result.success) {
      const newAccount = {
        id: accountsDB.length + 1,
        email,
        provider,
        status: 'active',
        lastSync: new Date().toISOString(),
        totalProcessed: 0,
        createdAt: new Date().toISOString()
      };

      accountsDB.push(newAccount);
      res.json({ success: true, account: newAccount });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/accounts', (req, res) => {
  res.json(accountsDB);
});

// Синхронизация email аккаунтов
app.post('/api/accounts/:email/sync', async (req, res) => {
  try {
    const { email } = req.params;
    const account = accountsDB.find(acc => acc.email === email);
    
    if (!account) {
      return res.status(404).json({ error: 'Аккаунт не найден' });
    }

    const newEmails = await emailConnector.fetchNewEmails(email);
    const processedDocuments = [];

    for (const emailMsg of newEmails) {
      for (const attachment of emailMsg.attachments) {
        try {
          const downloadedFile = await emailConnector.downloadAttachment(
            email, 
            emailMsg.id, 
            attachment
          );

          const document = {
            id: documentsDB.length + 1,
            filename: downloadedFile.filename,
            originalName: attachment.filename,
            sender: emailMsg.from,
            received: emailMsg.date,
            size: downloadedFile.size,
            mimeType: downloadedFile.mimeType,
            category: classifyDocument(attachment.filename),
            status: 'processed',
            source: emailMsg.source,
            filePath: downloadedFile.filepath
          };

          documentsDB.push(document);
          processedDocuments.push(document);
        } catch (error) {
          console.error('Ошибка обработки вложения:', error);
        }
      }
    }

    // Обновляем статистику аккаунта
    account.lastSync = new Date().toISOString();
    account.totalProcessed += processedDocuments.length;

    res.json({
      success: true,
      processedCount: processedDocuments.length,
      documents: processedDocuments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Управление документами
app.get('/api/documents', (req, res) => {
  const { search, category, limit = 50 } = req.query;
  
  let filteredDocs = [...documentsDB];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredDocs = filteredDocs.filter(doc => 
      doc.filename.toLowerCase().includes(searchLower) ||
      doc.sender.toLowerCase().includes(searchLower)
    );
  }
  
  if (category) {
    filteredDocs = filteredDocs.filter(doc => doc.category === category);
  }
  
  res.json(filteredDocs.slice(0, parseInt(limit)));
});

app.get('/api/documents/categories', (req, res) => {
  const categories = documentsDB.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {});
  
  const result = Object.entries(categories).map(([name, count]) => ({
    name,
    count,
    icon: getCategoryIcon(name)
  }));
  
  res.json(result);
});

// Загрузка файлов
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => {
      const document = {
        id: documentsDB.length + 1,
        filename: file.originalname,
        sender: 'Manual Upload',
        received: new Date().toISOString(),
        size: file.size,
        mimeType: file.mimetype,
        category: classifyDocument(file.originalname),
        status: 'processed',
        source: 'upload',
        filePath: file.path
      };
      
      documentsDB.push(document);
      return document;
    });
    
    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Настройки
app.get('/api/settings', (req, res) => {
  res.json(settingsDB);
});

app.post('/api/settings', (req, res) => {
  settingsDB = { ...settingsDB, ...req.body };
  res.json({ success: true, settings: settingsDB });
});

// Webhook для real-time уведомлений
app.post('/api/webhook/email', (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    
    // Проверка подписи webhook (для безопасности)
    const expectedSignature = crypto
      .createHmac('sha256', emailConnector.webhookSecret)
      .update(payload)
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(401).json({ error: 'Неверная подпись webhook' });
    }
    
    // Обработка webhook события
    console.log('Получен webhook:', req.body);
    
    // Здесь можно добавить логику для обработки real-time уведомлений
    // о новых письмах от email провайдеров
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Утилиты для классификации документов
function classifyDocument(filename) {
  const extension = path.extname(filename).toLowerCase();
  const name = filename.toLowerCase();
  
  if (name.includes('invoice') || name.includes('счет')) return 'Invoices';
  if (name.includes('contract') || name.includes('договор')) return 'Contracts';
  if (name.includes('report') || name.includes('отчет')) return 'Reports';
  if (['.ppt', '.pptx'].includes(extension)) return 'Presentations';
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(extension)) return 'Images';
  if (['.zip', '.rar', '.7z'].includes(extension)) return 'Archives';
  
  return 'Other';
}

function getCategoryIcon(category) {
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

function getDefaultHost(provider) {
  const hosts = {
    'Outlook': 'outlook.office365.com',
    'Yahoo': 'imap.mail.yahoo.com',
    'Other': 'imap.gmail.com'
  };
  return hosts[provider] || 'imap.gmail.com';
}

// Автоматическая синхронизация каждые 5 минут
setInterval(async () => {
  if (settingsDB.autoProcessing) {
    for (const account of accountsDB.filter(acc => acc.status === 'active')) {
      try {
        console.log(`Автосинхронизация: ${account.email}`);
        // Здесь можно добавить автоматическую синхронизацию
      } catch (error) {
        console.error(`Ошибка автосинхронизации ${account.email}:`, error);
      }
    }
  }
}, 5 * 60 * 1000); // 5 минут

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Email Document Collector сервер запущен на порту ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/api/webhook/email`);
});

module.exports = app;