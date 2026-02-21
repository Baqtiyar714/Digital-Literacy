# Auth Backend API

Simple Node.js + Express + PostgreSQL API server for user management.

## 📋 Prerequisites / Алғышарттар / Предварительные требования

Before running this project, make sure you have:

- **Node.js** (v14 or higher) installed
- **PostgreSQL** installed and running
- **PostgreSQL database** named `auth_db` created
- **Users table** created with the following schema:

```sql
CREATE DATABASE auth_db;

\c auth_db;

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Installation / Орнату / Установка

1. **Install dependencies / Тәуелділіктерді орнату / Установить зависимости:**
   ```bash
   npm install
   ```

2. **Configure environment variables / Орта айнымалыларын баптау / Настроить переменные окружения:**
   
   Copy `.env` file and update with your database credentials:
   ```bash
   # The .env file is already included with default values
   # .env файлы әдепкі мәндермен қосылған
   # Файл .env уже включен со значениями по умолчанию
   ```

3. **Update database credentials in `.env` if needed:**
   - If your PostgreSQL password is not `1234`, update `DB_PASSWORD` in `.env`
   - If your database name is different, update `DB_NAME` in `.env`

## ▶️ Running the Server / Серверді іске қосу / Запуск сервера

**Start the server / Серверді бастау / Запустить сервер:**
```bash
npm start
```

**For development with auto-reload / Автоматикалық қайта жүктеумен дамыту үшін / Для разработки с автоматической перезагрузкой:**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints / API нүктелері / API конечные точки

### 1. Health Check
```
GET /health
```
Returns server status.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Get All Users
```
GET /users
```
Returns a list of all users (without passwords).

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get User by ID
```
GET /users/:id
```
Returns a single user by ID (without password).

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "User with ID 999 not found"
}
```

## 🗂️ Project Structure / Жоба құрылымы / Структура проекта

```
.
├── db.js              # Database connection pool
├── index.js            # Main server file
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## 🔧 Configuration / Баптау / Настройка

All configuration is done through the `.env` file:

- `DB_USER` - PostgreSQL username (default: postgres)
- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_NAME` - Database name (default: auth_db)
- `DB_PASSWORD` - PostgreSQL password (default: 1234)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `PORT` - Server port (default: 5000)

## 🔒 Security Notes / Қауіпсіздік ескертулері / Заметки о безопасности

- ✅ Passwords are **never** returned in API responses
- ✅ Input validation is performed on user IDs
- ✅ Error messages don't expose sensitive database information
- ⚠️ For production, consider adding:
  - Authentication/Authorization (JWT)
  - Rate limiting
  - Input sanitization
  - Helmet.js for security headers
  - HTTPS

## 🐛 Troubleshooting / Мәселелерді шешу / Устранение неполадок

**Connection Error:**
- Make sure PostgreSQL is running
- Check database credentials in `.env`
- Verify database `auth_db` exists

**Table doesn't exist:**
- Run the SQL schema provided in Prerequisites section

**Port already in use:**
- Change `PORT` in `.env` to a different port

## 📦 Dependencies / Тәуелділіктер / Зависимости

- **express** - Web framework
- **pg** - PostgreSQL client
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📝 License / Лицензия / Лицензия

ISC


