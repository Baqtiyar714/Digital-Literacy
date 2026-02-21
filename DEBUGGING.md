# 🔧 Debugging Guide / Жіптеу нұсқаулығы / Руководство по отладке

## Step-by-Step Debugging / Қадам-қадам жіптеу / Пошаговая отладка

### 1. Backend серверін тексеру / Проверка сервера / Check Backend Server

**Terminal/Command Prompt-та:**

```bash
# Серверді іске қосыңыз / Запустите сервер / Start the server
npm start
```

**Күту керек / Ожидаемый вывод / Expected output:**
```
✅ Connected to PostgreSQL database
🚀 Server is running on http://localhost:5000
📊 Health check: http://localhost:5000/health
👥 Users endpoint: http://localhost:5000/users
```

**Егер қате шықса / Если ошибка / If error:**
- PostgreSQL іске қосылған ба? / Запущен ли PostgreSQL? / Is PostgreSQL running?
- БД `auth_db` құрылған ба? / Создана ли БД `auth_db`? / Is database `auth_db` created?
- `.env` файлында дұрыс пароль бар ма? / Правильный ли пароль в `.env`? / Is password correct in `.env`?

---

### 2. Browser Console-ды ашу / Открыть консоль браузера / Open Browser Console

**Chrome/Edge:**
- `F12` басыңыз / Нажмите `F12` / Press `F12`
- Немесе / Или / Or: Right-click → Inspect → Console

**Firefox:**
- `F12` басыңыз / Нажмите `F12` / Press `F12`
- Немесе / Или / Or: Right-click → Inspect Element → Console

**Console-да күту керек / Ожидаемый вывод в консоли / Expected console output:**
```
Page loaded, testing server connection...
✅ Server connection OK
```

---

### 3. Test Connection файлын пайдалану / Использовать тестовый файл / Use Test File

1. `test-connection.html` файлын браузерде ашыңыз
   / Откройте файл `test-connection.html` в браузере
   / Open `test-connection.html` file in browser

2. Барлық тесттерді басыңыз / Нажмите все тесты / Click all tests

3. Нәтижелерді тексеріңіз / Проверьте результаты / Check results

---

### 4. CORS мәселесін тексеру / Проверка CORS / Check CORS

**Егер CORS қатесі шықса / Если ошибка CORS / If CORS error:**

Backend `index.js` файлында CORS` дұрыс бапталған ба?
/ Правильно ли настроен CORS в файле `index.js`?
/ Is CORS properly configured in `index.js`?

```javascript
app.use(cors({
    origin: '*',  // Барлық нүктелерге рұқсат / Разрешить все / Allow all
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
```

---

### 5. URL дұрыстығын тексеру / Проверка URL / Check URL

**`api.js` файлында:**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**Тексеріңіз / Проверьте / Check:**
- ✅ Port 5000 дұрыс па? / Правильный ли порт 5000? / Is port 5000 correct?
- ✅ `localhost` орнына `127.0.0.1` пайдалансаңыз, ол да жұмыс істейді
   / Если используете `127.0.0.1` вместо `localhost`, это тоже работает
   / If using `127.0.0.1` instead of `localhost`, that also works

---

### 6. Network Tab-ты тексеру / Проверка Network / Check Network Tab

1. Browser DevTools-ты ашыңыз / Откройте DevTools / Open DevTools (`F12`)
2. **Network** табын басыңыз / Нажмите вкладку **Network** / Click **Network** tab
3. Форманы толтырып, Submit басыңыз / Заполните форму и нажмите Submit
4. Network табында `/register` немесе `/login` сұрауын табыңыз
   / Найдите запрос `/register` или `/login` во вкладке Network
   / Find `/register` or `/login` request in Network tab

**Тексеріңіз / Проверьте / Check:**
- Status Code: `200` (OK) немесе `201` (Created) болуы керек
- Request URL: `http://localhost:5000/register` дұрыс па?
- Response: JSON деректері бар ма?

---

### 7. Common Issues / Жиі кездесетін мәселелер / Частые проблемы

#### Issue 1: "Network error" / "Желі қатесі"
**Себебі / Причина / Cause:**
- Сервер іске қосылмаған / Сервер не запущен / Server not running
- Порт бұғатталған / Порт заблокирован / Port blocked

**Шешу / Решение / Solution:**
```bash
# Серверді қайта іске қосыңыз / Перезапустите сервер / Restart server
npm start
```

#### Issue 2: "CORS policy" қатесі
**Себебі / Причина / Cause:**
- CORS дұрыс бапталмаған / CORS неправильно настроен / CORS not configured

**Шешу / Решение / Solution:**
- `index.js` файлында CORS баптауын тексеріңіз / Проверьте настройки CORS в `index.js`

#### Issue 3: "Cannot POST /register"
**Себебі / Причина / Cause:**
- Route дұрыс анықталмаған / Маршрут неправильно определен / Route not defined

**Шешу / Решение / Solution:**
- `index.js` файлында `app.post('/register', ...)` бар екенін тексеріңіз

#### Issue 4: PostgreSQL қатесі
**Себебі / Причина / Cause:**
- БД қосылмаған / БД не подключена / DB not connected
- Пароль дұрыс емес / Неправильный пароль / Wrong password

**Шешу / Решение / Solution:**
- `.env` файлында парольді тексеріңіз / Проверьте пароль в `.env`
- PostgreSQL іске қосылған ба? / Запущен ли PostgreSQL? / Is PostgreSQL running?

---

### 8. Quick Test Commands / Жылдам тест командалары / Быстрые тестовые команды

**Terminal-да / В терминале / In terminal:**
```bash
# Health check тесті / Тест health check / Health check test
curl http://localhost:5000/health

# Users list тесті / Тест списка пользователей / Users list test
curl http://localhost:5000/users

# Register тесті / Тест регистрации / Register test
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

**Егер curl жұмыс істемесе / Если curl не работает / If curl doesn't work:**
- Browser-да `http://localhost:5000/health` ашып көріңіз
  / Откройте `http://localhost:5000/health` в браузере
  / Open `http://localhost:5000/health` in browser

---

### 9. Final Checklist / Соңғы тексеру тізімі / Финальный чеклист

- [ ] PostgreSQL іске қосылған / PostgreSQL запущен / PostgreSQL running
- [ ] БД `auth_db` құрылған / БД `auth_db` создана / DB `auth_db` created
- [ ] `users` кестесі құрылған / Таблица `users` создана / Table `users` created
- [ ] Backend сервері іске қосылған (port 5000) / Backend сервер запущен / Backend server running
- [ ] `.env` файлы дұрыс бапталған / Файл `.env` правильно настроен / `.env` file configured
- [ ] Browser console-да қате жоқ / Нет ошибок в консоли браузера / No errors in browser console
- [ ] Network tab-та сұраулар көрінеді / Запросы видны во вкладке Network / Requests visible in Network tab

---

### 10. Still Not Working? / Әлі де жұмыс істемейді? / Все еще не работает?

**Браузер консоліндегі нақты қатені көршіңіз:**
/ Покажите точную ошибку из консоли браузера:
/ Show the exact error from browser console:

1. `F12` басыңыз / Нажмите `F12` / Press `F12`
2. Console табын ашыңыз / Откройте вкладку Console / Open Console tab
3. Қатені көшіріп, маған жіберіңіз / Скопируйте ошибку и отправьте мне / Copy error and send to me

**Network tab-тағы сұрау деректерін көршіңіз:**
/ Покажите данные запроса из Network tab:
/ Show request data from Network tab:

1. Network табын ашыңыз / Откройте вкладку Network / Open Network tab
2. `/register` сұрауын табыңыз / Найдите запрос `/register` / Find `/register` request
3. Оны басып, Response/Headers-ты көршіңіз / Кликните на него, покажите Response/Headers / Click it, show Response/Headers


