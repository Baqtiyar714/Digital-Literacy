-- Database Setup Script / БД орнату скрипті / Скрипт настройки БД
-- Run this script in PostgreSQL to create the database and table
-- Бұл скриптті PostgreSQL-де орындап, БД мен кестені құрыңыз
-- Запустите этот скрипт в PostgreSQL для создания БД и таблицы

-- Create database / БД құру / Создать БД
CREATE DATABASE auth_db;

-- Connect to the database / БД-ға қосу / Подключиться к БД
\c auth_db;

-- Create users table / Пайдаланушылар кестесін құру / Создать таблицу пользователей
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert sample data for testing / Тестілеу үшін үлгі деректерді енгізу / Опционально: вставить тестовые данные
-- INSERT INTO users (name, email, password) VALUES 
-- ('John Doe', 'john@example.com', 'hashed_password_here'),
-- ('Jane Smith', 'jane@example.com', 'hashed_password_here');

-- Verify table creation / Кестенің құрылғанын тексеру / Проверить создание таблицы
SELECT * FROM users;


