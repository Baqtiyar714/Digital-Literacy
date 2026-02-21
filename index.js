// index.js - Main server file
// Негізгі сервер файлы
// Основной файл сервера

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Орталық бағдарламалық қамтамасыздандыру
// Промежуточное программное обеспечение

// CORS configuration - Allow all origins for development
// CORS баптауы - Дамыту үшін барлық бастапқы нүктелерге рұқсат
// Конфигурация CORS - Разрешить все источники для разработки
app.use(cors({
    origin: '*', // Allow all origins / Барлық нүктелерге рұқсат / Разрешить все источники
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Parse JSON bodies
// JSON денелерін талдау
// Парсинг JSON тел
app.use(express.json());

// Serve static files (HTML, CSS, JS) from current directory
// Статикалық файлдарды (HTML, CSS, JS) ағымдағы папкадан беру
// Отдавать статические файлы (HTML, CSS, JS) из текущей папки
app.use(express.static(__dirname));

// Request logging middleware (for debugging)
// Сұрау журналдау орталық бағдарламалық қамтамасыздандыру (жіптеу үшін)
// Промежуточное ПО для логирования запросов (для отладки)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES / БАҒЫТТАР / МАРШРУТЫ
// ============================================

// GET /users - Get all users
// Барлық пайдаланушыларды алу
// Получить всех пользователей
app.get('/users', async (req, res) => {
    try {
        // Query to get all users (excluding password for security)
        // Барлық пайдаланушыларды алу сұрауы (қауіпсіздік үшін парольді қоспау)
        // Запрос для получения всех пользователей (исключая пароль для безопасности)
        const query = `
            SELECT id, name, email, created_at 
            FROM users 
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query);
        
        // Return success response with users array
        // Сәтті жауапты пайдаланушылар массивімен қайтару
        // Вернуть успешный ответ с массивом пользователей
        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching users:', error);
        // Пайдаланушыларды алу кезіндегі қате
        // Ошибка при получении пользователей
        
        res.status(500).json({
            success: false,
            message: 'Error fetching users from database',
            // БД-дан пайдаланушыларды алу кезіндегі қате
            // Ошибка при получении пользователей из БД
            error: error.message
        });
    }
});

// POST /register - Register a new user
// Жаңа пайдаланушыны тіркеу
// Регистрация нового пользователя
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        // Кіріс деректерін тексеру
        // Проверка входных данных
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required (name, email, password)',
                // Барлық өрістер міндетті (аты, электрондық пошта, пароль)
                // Все поля обязательны (имя, электронная почта, пароль)
            });
        }
        
        // Validate email format
        // Электрондық пошта форматын тексеру
        // Проверка формата электронной почты
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                // Жарамсыз электрондық пошта форматы
                // Неверный формат электронной почты
            });
        }
        
        // Validate password length
        // Пароль ұзындығын тексеру
        // Проверка длины пароля
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
                // Пароль кемінде 6 таңбадан тұруы керек
                // Пароль должен содержать не менее 6 символов
            });
        }
        
        // Check if user already exists
        // Пайдаланушы бұрыннан бар ма екенін тексеру
        // Проверка существования пользователя
        const checkUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (checkUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
                // Бұл электрондық поштамен пайдаланушы бұрыннан бар
                // Пользователь с этой электронной почтой уже существует
            });
        }
        
        // Hash password
        // Парольді хештеу
        // Хеширование пароля
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        // Жаңа пайдаланушыны енгізу
        // Вставка нового пользователя
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );
        
        // Return success response
        // Сәтті жауапты қайтару
        // Вернуть успешный ответ
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            // Пайдаланушы сәтті тіркелді
            // Пользователь успешно зарегистрирован
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error registering user:', error);
        // Пайдаланушыны тіркеу кезіндегі қате
        // Ошибка при регистрации пользователя
        
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            // Пайдаланушыны тіркеу кезіндегі қате
            // Ошибка при регистрации пользователя
            error: error.message
        });
    }
});

// POST /login - Login user
// Пайдаланушыға кіру
// Вход пользователя
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        // Кіріс деректерін тексеру
        // Проверка входных данных
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
                // Электрондық пошта мен пароль міндетті
                // Электронная почта и пароль обязательны
            });
        }
        
        // Find user by email
        // Электрондық пошта бойынша пайдаланушыны табу
        // Найти пользователя по электронной почте
        const result = await pool.query(
            'SELECT id, name, email, password, created_at FROM users WHERE email = $1',
            [email]
        );
        
        // Check if user exists
        // Пайдаланушы бар ма екенін тексеру
        // Проверка существования пользователя
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                // Жарамсыз электрондық пошта немесе пароль
                // Неверная электронная почта или пароль
            });
        }
        
        const user = result.rows[0];
        
        // Verify password
        // Парольді тексеру
        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                // Жарамсыз электрондық пошта немесе пароль
                // Неверная электронная почта или пароль
            });
        }
        
        // Remove password from response
        // Жауаптан парольді алып тастау
        // Удалить пароль из ответа
        delete user.password;
        
        // Return success response
        // Сәтті жауапты қайтару
        // Вернуть успешный ответ
        res.status(200).json({
            success: true,
            message: 'Login successful',
            // Кіру сәтті
            // Вход успешен
            data: user
        });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        // Пайдаланушыға кіру кезіндегі қате
        // Ошибка при входе пользователя
        
        res.status(500).json({
            success: false,
            message: 'Error logging in user',
            // Пайдаланушыға кіру кезіндегі қате
            // Ошибка при входе пользователя
            error: error.message
        });
    }
});

// GET /users/:id - Get single user by ID
// ID бойынша бір пайдаланушыны алу
// Получить одного пользователя по ID
app.get('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Validate ID
        // ID-ді тексеру
        // Проверка ID
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID. ID must be a number.',
                // Жарамсыз пайдаланушы ID. ID сан болуы керек.
                // Неверный ID пользователя. ID должен быть числом.
            });
        }
        
        // Query to get user by ID (excluding password)
        // ID бойынша пайдаланушыны алу сұрауы (парольсіз)
        // Запрос для получения пользователя по ID (без пароля)
        const query = `
            SELECT id, name, email, created_at 
            FROM users 
            WHERE id = $1
        `;
        
        const result = await pool.query(query, [userId]);
        
        // Check if user exists
        // Пайдаланушы бар ма екенін тексеру
        // Проверка существования пользователя
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `User with ID ${userId} not found`,
                // ID ${userId} пайдаланушысы табылмады
                // Пользователь с ID ${userId} не найден
            });
        }
        
        // Return success response with user data
        // Сәтті жауапты пайдаланушы деректерімен қайтару
        // Вернуть успешный ответ с данными пользователя
        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error fetching user:', error);
        // Пайдаланушыны алу кезіндегі қате
        // Ошибка при получении пользователя
        
        res.status(500).json({
            success: false,
            message: 'Error fetching user from database',
            // БД-дан пайдаланушыны алу кезіндегі қате
            // Ошибка при получении пользователя из БД
            error: error.message
        });
    }
});

// Health check endpoint
// Денсаулық тексеру нүктесі
// Точка проверки работоспособности
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        // Сервер жұмыс істеп тұр
        // Сервер работает
        timestamp: new Date().toISOString()
    });
});

// 404 handler for undefined routes
// Анықталмаған бағыттар үшін 404 басқарушысы
// Обработчик 404 для неопределенных маршрутов
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        // Бағыт табылмады
        // Маршрут не найден
    });
});

// Start the server
// Серверді іске қосу
// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    // Сервер http://localhost:${PORT} мекенжайында жұмыс істеп тұр
    // Сервер работает по адресу http://localhost:${PORT}
    console.log(`\n📱 Frontend Pages / Фронтенд беттері / Фронтенд страницы:`);
    console.log(`   🏠 Login: http://localhost:${PORT}/index.html`);
    console.log(`   📝 Register: http://localhost:${PORT}/register.html`);
    console.log(`   🔍 Test: http://localhost:${PORT}/test-connection.html`);
    console.log(`\n📡 API Endpoints / API нүктелері / API конечные точки:`);
    console.log(`   📊 Health: http://localhost:${PORT}/health`);
    console.log(`   👥 Users: http://localhost:${PORT}/users`);
    console.log(`   ➕ Register: http://localhost:${PORT}/register (POST)`);
    console.log(`   🔐 Login: http://localhost:${PORT}/login (POST)`);
    console.log(`\n✅ Open http://localhost:${PORT}/index.html in your browser!`);
    console.log(`   Браузерде http://localhost:${PORT}/index.html ашыңыз!`);
    console.log(`   Откройте http://localhost:${PORT}/index.html в браузере!\n`);
});

