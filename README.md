# Email Document Collector - Backend Integration

## Установка и настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корневой директории:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (если используете базу данных)
DATABASE_URL=mongodb://localhost:27017/email-document-collector
# или для PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/email_docs

# Email Provider Settings
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/auth/google/callback

OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret

# Security
JWT_SECRET=your-jwt-secret-key
WEBHOOK_SECRET=your-webhook-secret-key
ENCRYPTION_KEY=your-encryption-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
STORAGE_PROVIDER=local

# Email Settings
AUTO_SYNC_INTERVAL=300000
MAX_EMAILS_PER_SYNC=50
```

### 3. Настройка Gmail API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Gmail API
4. Создайте OAuth 2.0 credentials
5. Добавьте redirect URI: `http://localhost:3000/auth/google/callback`
6. Скопируйте Client ID и Client Secret в `.env`

### 4. Настройка Outlook API

1. Перейдите в [Azure Portal](https://portal.azure.com/)
2. Зарегистрируйте новое приложение в Azure AD
3. Добавьте разрешения для Microsoft Graph API:
   - Mail.Read
   - Mail.ReadWrite
   - Files.ReadWrite
4. Добавьте redirect URI
5. Скопируйте Application ID и Client Secret в `.env`

### 5. Запуск сервера

Для разработки:
```bash
npm run dev
```

Для продакшена:
```bash
npm start
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Получить статистику дашборда

### Email Accounts
- `GET /api/accounts` - Список всех аккаунтов
- `POST /api/accounts` - Добавить новый аккаунт
- `POST /api/accounts/:email/sync` - Синхронизировать аккаунт
- `DELETE /api/accounts/:id` - Удалить аккаунт

### Documents
- `GET /api/documents` - Список документов с фильтрацией
- `GET /api/documents/categories` - Статистика по категориям
- `GET /api/documents/:id` - Получить конкретный документ
- `DELETE /api/documents/:id` - Удалить документ

### Upload
- `POST /api/upload` - Загрузить файлы вручную

### Settings
- `GET /api/settings` - Получить настройки
- `POST /api/settings` - Обновить настройки

### Webhooks
- `POST /api/webhook/email` - Webhook для real-time уведомлений

## Поддерживаемые Email Провайдеры

### Gmail
- Использует Gmail API
- Требует OAuth 2.0 аутентификацию
- Поддерживает real-time push уведомления

### Outlook/Office 365
- Использует Microsoft Graph API
- Требует Azure AD регистрацию
- Поддерживает webhooks

### Yahoo Mail
- Использует IMAP протокол
- Требует App Password
- Polling-based синхронизация

### Другие IMAP провайдеры
- Поддержка стандартного IMAP
- Настраиваемые хосты и порты
- SSL/TLS шифрование

## Архитектура системы

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Email APIs    │    │   Email Parser   │    │   Document      │
│                 │    │                  │    │   Classifier    │
│ • Gmail API     │───▶│ • MIME Parser    │───▶│                 │
│ • Outlook API   │    │ • Attachment     │    │ • ML-based      │
│ • IMAP/SMTP     │    │   Extractor      │    │   categorization│
│ • Webhooks      │    │ • Metadata       │    │ • Rule-based    │
└─────────────────┘    │   Extraction     │    │   classification│
                       └──────────────────┘    └─────────────────┘
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Client    │    │   REST API       │    │   File Storage  │
│                 │    │                  │    │                 │
│ • Dashboard     │◀───│ • Express.js     │───▶│ • Local Files   │
│ • Account Mgmt  │    │ • Authentication │    │ • Cloud Storage │
│ • Document View │    │ • Rate Limiting  │    │ • Backup        │
│ • Settings      │    │ • Error Handling │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ▼
                       ┌──────────────────┐
                       │    Database      │
                       │                  │
                       │ • Document Meta  │
                       │ • Account Info   │
                       │ • User Settings  │
                       │ • Sync Logs      │
                       └──────────────────┘
```

## Безопасность

### Аутентификация
- OAuth 2.0 для Gmail и Outlook
- App Passwords для IMAP
- JWT токены для API аутентификации

### Шифрование
- Все пароли хешируются с bcrypt
- Чувствительные данные шифруются в покое
- HTTPS обязателен в продакшене

### Rate Limiting
- API rate limiting для предотвращения злоупотреблений
- Exponential backoff для email API вызовов

### Валидация
- Строгая валидация всех входных данных
- Sanitization файловых путей
- MIME type проверка для загружаемых файлов

## Мониторинг и логирование

### Логи
- Структурированное логирование (JSON)
- Ротация логов по размеру и дате
- Разные уровни логирования

### Метрики
- API response times
- Email sync statistics
- Error rates and types
- Storage usage

### Health Checks
- `GET /health` - Статус системы
- `GET /health/email` - Статус email соединений
- `GET /health/storage` - Статус хранилища

## Развертывание

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - database
  
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=email_docs
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Переменные окружения для продакшена
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@database:5432/email_docs
JWT_SECRET=secure-random-string
WEBHOOK_SECRET=another-secure-string
UPLOAD_DIR=/app/uploads
```

## Обслуживание

### Backup
- Регулярное резервное копирование базы данных
- Синхронизация файлов с облачным хранилищем
- Экспорт настроек и метаданных

### Обновления
- Graceful shutdown для zero-downtime deployments
- Database migrations
- Configuration validation

## Troubleshooting

### Частые проблемы

1. **Gmail API Quota Exceeded**
   - Решение: Увеличить интервал синхронизации
   - Проверить лимиты в Google Cloud Console

2. **IMAP Connection Timeout**
   - Решение: Проверить настройки сети и firewall
   - Использовать правильные порты (993 для SSL)

3. **File Upload Errors**
   - Решение: Проверить разрешения папки uploads
   - Увеличить лимит размера файла

### Логи отладки
```bash
# Включить детальное логирование
DEBUG=email-collector:* npm run dev

# Логи только для IMAP
DEBUG=email-collector:imap npm run dev

# Логи для Gmail API
DEBUG=email-collector:gmail npm run dev
```

## Contribution

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## License

MIT License - см. файл LICENSE для деталей.