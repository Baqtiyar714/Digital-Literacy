
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

SELECT * FROM users;


