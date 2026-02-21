// db.js - Database connection configuration
// БД байланысын баптау файлы
// Файл настройки подключения к БД

const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
// Байланыс пулын құру
// Создание пула подключений
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'auth_db',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
    // PostgreSQL БД-ға қосылды
    // Подключено к PostgreSQL БД
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    // Байланыста күтпеген қате
    // Неожиданная ошибка подключения
    process.exit(-1);
});

// Export the pool for use in other files
// Басқа файлдарда пайдалану үшін экспорттау
// Экспорт пула для использования в других файлах
module.exports = pool;


