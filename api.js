// api.js - API utility functions for frontend
// API утилиталық функциялары
// Утилитарные функции API

const API_BASE_URL = 'http://localhost:5000';

// Show message to user
// Пайдаланушыға хабарлама көрсету
// Показать сообщение пользователю
function showMessage(message, type = 'error') {
    // Remove existing message
    // Бар хабарламаны жою
    // Удалить существующее сообщение
    const existingMessage = document.querySelector('.api-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    // Хабарлама элементін құру
    // Создать элемент сообщения
    const messageDiv = document.createElement('div');
    messageDiv.className = `api-message ${type}`;
    messageDiv.textContent = message;
    
    // Add styles
    // Стильдерді қосу
    // Добавить стили
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
    }
    
    // Add to page
    // Бетке қосу
    // Добавить на страницу
    document.body.appendChild(messageDiv);
    
    // Remove after 5 seconds
    // 5 секундтан кейін жою
    // Удалить через 5 секунд
    setTimeout(() => {
        messageDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Add CSS animations
// CSS анимацияларын қосу
// Добавить CSS анимации
if (!document.getElementById('api-message-styles')) {
    const style = document.createElement('style');
    style.id = 'api-message-styles';
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Test server connection
// Сервер байланысын тексеру
// Проверить подключение к серверу
async function testConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            console.log('✅ Server connection OK');
            return true;
        } else {
            console.error('❌ Server responded with error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Cannot connect to server:', error.message);
        console.error('Make sure the server is running on', API_BASE_URL);
        return false;
    }
}

// Register user
// Пайдаланушыны тіркеу
// Зарегистрировать пользователя
async function registerUser(name, email, password) {
    try {
        console.log('Attempting to register user...');
        console.log('API URL:', `${API_BASE_URL}/register`);
        
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        
        // Check if response is OK before parsing JSON
        // JSON-ды талдамас бұрын жауаптың дұрыс екенін тексеру
        // Проверить, что ответ OK перед парсингом JSON
        if (!response.ok) {
            // Try to get error message from response
            // Жауаптан қате хабарламасын алуға тырысу
            // Попытаться получить сообщение об ошибке из ответа
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: `Server error: ${response.status} ${response.statusText}` };
            }
            
            console.error('Server error:', errorData);
            showMessage(errorData.message || `Server error: ${response.status}`);
            return { success: false, message: errorData.message };
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            showMessage('Registration successful! Redirecting to login...', 'success');
            // Тіркелу сәтті! Кіру бетіне бағыттау...
            // Регистрация успешна! Перенаправление на страницу входа...
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
            return { success: true, data: data.data };
        } else {
            showMessage(data.message || 'Registration failed');
            // Тіркелу сәтсіз
            // Регистрация не удалась
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Registration error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // More specific error messages
        // Неғұрлым нақты қате хабарламалары
        // Более конкретные сообщения об ошибках
        let errorMessage = 'Network error. ';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += 'Cannot connect to server. ';
            errorMessage += `Make sure the server is running on ${API_BASE_URL}`;
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please check if the server is running.';
        }
        
        showMessage(errorMessage);
        // Желі қатесі. Сервер жұмыс істеп тұрғанын тексеріңіз.
        // Ошибка сети. Проверьте, запущен ли сервер.
        return { success: false, message: errorMessage };
    }
}

// Login user
// Пайдаланушыға кіру
// Войти пользователю
async function loginUser(email, password) {
    try {
        console.log('Attempting to login user...');
        console.log('API URL:', `${API_BASE_URL}/login`);
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        
        // Check if response is OK before parsing JSON
        // JSON-ды талдамас бұрын жауаптың дұрыс екенін тексеру
        // Проверить, что ответ OK перед парсингом JSON
        if (!response.ok) {
            // Try to get error message from response
            // Жауаптан қате хабарламасын алуға тырысу
            // Попытаться получить сообщение об ошибке из ответа
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: `Server error: ${response.status} ${response.statusText}` };
            }
            
            console.error('Server error:', errorData);
            showMessage(errorData.message || `Server error: ${response.status}`);
            return { success: false, message: errorData.message };
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            showMessage('Login successful! Welcome back!', 'success');
            // Кіру сәтті! Қош келдіңіз!
            // Вход успешен! Добро пожаловать!
            
            // Store user data in localStorage
            // Пайдаланушы деректерін localStorage-та сақтау
            // Сохранить данные пользователя в localStorage
            localStorage.setItem('user', JSON.stringify(data.data));
            
            // Redirect to main page (dashboard)
            // Басты бетке (бақылау тақтасына) бағыттау
            // Перенаправление на главную страницу (дашборд)
            showMessage('Кіру сәтті! Басты бетке бағытталуда...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
            
            return { success: true, data: data.data };
        } else {
            showMessage(data.message || 'Login failed');
            // Кіру сәтсіз
            // Вход не удался
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // More specific error messages
        // Неғұрлым нақты қате хабарламалары
        // Более конкретные сообщения об ошибках
        let errorMessage = 'Network error. ';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += 'Cannot connect to server. ';
            errorMessage += `Make sure the server is running on ${API_BASE_URL}`;
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please check if the server is running.';
        }
        
        showMessage(errorMessage);
        // Желі қатесі. Сервер жұмыс істеп тұрғанын тексеріңіз.
        // Ошибка сети. Проверьте, запущен ли сервер.
        return { success: false, message: errorMessage };
    }
}

