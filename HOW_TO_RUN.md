# 🚀 Серверді қалай іске қосу / Как запустить сервер / How to Run the Server

## Windows-та / На Windows / On Windows

### 1-қадам: Terminal/Command Prompt ашу / Открыть терминал / Open Terminal

**Әдіс 1: Command Prompt**
- `Windows + R` басыңыз
- `cmd` енгізіп, Enter басыңыз
- Немесе Start менюден "Command Prompt" табыңыз

**Әдіс 2: PowerShell**
- `Windows + X` басыңыз
- "Windows PowerShell" немесе "Terminal" таңдаңыз

**Әдіс 3: VS Code Terminal**
- VS Code-ты ашыңыз
- `Ctrl + ~` (тильда) басыңыз
- Немесе менюден: Terminal → New Terminal

---

### 2-қадам: Проект папкасына өту / Перейти в папку проекта / Navigate to Project Folder

Terminal-да мына команданы орындаңыз:
/ В терминале выполните команду:
/ In terminal, run this command:

```bash
cd "C:\Users\Бахтияр\OneDrive - Satbayev University\Рабочий стол\Login"
```

**Немесе / Или / Or:**

Егер сіз басқа папкада болсаңыз, мына командаларды пайдаланыңыз:
/ Если вы в другой папке, используйте эти команды:
/ If you're in a different folder, use these commands:

```bash
# Бір деңгей жоғарыға шығу / Подняться на уровень выше / Go up one level
cd ..

# Қазіргі папканы көрсету / Показать текущую папку / Show current folder
cd

# Барлық файлдарды көрсету / Показать все файлы / Show all files
dir
```

---

### 3-қадам: Node.js орнатылған ба тексеру / Проверить установлен ли Node.js / Check if Node.js is Installed

```bash
node --version
```

**Күту керек / Ожидаемый вывод / Expected output:**
```
v18.17.0
```
(немесе басқа версия / или другая версия / or another version)

**Егер қате шықса / Если ошибка / If error:**
- Node.js орнатылмаған / Node.js не установлен / Node.js not installed
- [Node.js сайтынан](https://nodejs.org/) орнатыңыз / Установите с сайта / Install from website

---

### 4-қадам: npm орнатылған ба тексеру / Проверить установлен ли npm / Check if npm is Installed

```bash
npm --version
```

**Күту керек / Ожидаемый вывод / Expected output:**
```
9.6.7
```
(немесе басқа версия / или другая версия / or another version)

---

### 5-қадам: Dependencies орнату / Установить зависимости / Install Dependencies

**Бірінші рет іске қосқанда / При первом запуске / First time running:**

```bash
npm install
```

Бұл команда `package.json` файлындағы барлық пакеттерді орнатады.
/ Эта команда установит все пакеты из файла `package.json`.
/ This command installs all packages from `package.json`.

**Күту керек / Ожидаемый вывод / Expected output:**
```
added 50 packages, and audited 51 packages in 5s
```

---

### 6-қадам: Серверді іске қосу / Запустить сервер / Start the Server

```bash
npm start
```

**Күту керек / Ожидаемый вывод / Expected output:**
```
✅ Connected to PostgreSQL database
🚀 Server is running on http://localhost:5000
📊 Health check: http://localhost:5000/health
👥 Users endpoint: http://localhost:5000/users
```

---

## ✅ Сервер іске қосылды! / Сервер запущен! / Server is Running!

Енді сіз:
/ Теперь вы можете:
/ Now you can:

1. **Browser-да тексеру / Проверить в браузере / Check in browser:**
   - `http://localhost:5000/health` ашыңыз
   - `http://localhost:5000/users` ашыңыз

2. **Frontend-ті ашу / Открыть фронтенд / Open frontend:**
   - `index.html` файлын браузерде ашыңыз
   - Немесе / Или / Or: `register.html` ашыңыз

---

## ⚠️ Егер қате шықса / Если ошибка / If Error

### Қате 1: "npm is not recognized"
**Себебі / Причина / Cause:** Node.js орнатылмаған
**Шешу / Решение / Solution:** Node.js орнатыңыз: https://nodejs.org/

### Қате 2: "Cannot find module"
**Себебі / Причина / Cause:** Dependencies орнатылмаған
**Шешу / Решение / Solution:**
```bash
npm install
```

### Қате 3: "Port 5000 already in use"
**Себебі / Причина / Cause:** Порт бос емес
**Шешу / Решение / Solution:**
- `.env` файлында `PORT=5001` деп өзгертіңіз
- Немесе / Или / Or: басқа портты пайдаланыңыз

### Қате 4: PostgreSQL connection error
**Себебі / Причина / Cause:** PostgreSQL іске қосылмаған немесе пароль дұрыс емес
**Шешу / Решение / Solution:**
1. PostgreSQL-ді іске қосыңыз
2. `.env` файлында парольді тексеріңіз
3. БД `auth_db` құрылған ба тексеріңіз

---

## 📝 Толық мысал / Полный пример / Full Example

```bash
# 1. Terminal ашу / Открыть терминал / Open terminal

# 2. Проект папкасына өту / Перейти в папку проекта / Navigate to project
cd "C:\Users\Бахтияр\OneDrive - Satbayev University\Рабочий стол\Login"

# 3. Node.js тексеру / Проверить Node.js / Check Node.js
node --version

# 4. Dependencies орнату (бірінші рет) / Установить зависимости (первый раз) / Install dependencies (first time)
npm install

# 5. Серверді іске қосу / Запустить сервер / Start server
npm start
```

---

## 🔄 Серверді тоқтату / Остановить сервер / Stop Server

Terminal-да:
/ В терминале:
/ In terminal:

```
Ctrl + C
```

---

## 💡 Кеңес / Совет / Tip

**Development режимінде / В режиме разработки / In development mode:**

`package.json`-да `dev` скрипті бар. Ол автоматикалық қайта жүктеумен жұмыс істейді:
/ В `package.json` есть скрипт `dev`. Он работает с автоматической перезагрузкой:
/ In `package.json` there's a `dev` script. It works with auto-reload:

```bash
npm run dev
```

Бұл команда файлдарды өзгерткенде серверді автоматикалық қайта жүктейді.
/ Эта команда автоматически перезагружает сервер при изменении файлов.
/ This command automatically reloads the server when files change.

---

## 📞 Көмек керек пе? / Нужна помощь? / Need Help?

Егер мәселе шешілмесе, мына ақпаратты жіберіңіз:
/ Если проблема не решена, отправьте эту информацию:
/ If problem persists, send this information:

1. Terminal-дағы толық қате хабарламасы
   / Полное сообщение об ошибке из терминала
   / Full error message from terminal

2. `node --version` нәтижесі
   / Результат `node --version`
   / Result of `node --version`

3. `npm --version` нәтижесі
   / Результат `npm --version`
   / Result of `npm --version`


