// ================================================
// index.js — Серверлік негізгі файл
// Node.js + Express.js негізінде жазылған
// Барлық API маршруттары осы файлда орналасқан
// ================================================

//  Қажетті кітапханаларды жүктеу ---
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();
const pool = require("./db");

//  questions_db деректер қорына қосылу ---
// auth_db үшін pool (db.js-тен), questions_db үшін жаңа pool жасалады
const { Pool } = require("pg");
const questionsPool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.QUESTIONS_DB_NAME || "questions_db",
  password: process.env.DB_PASSWORD || "1234",
  port: process.env.DB_PORT || 5432,
});
questionsPool.on("connect", () => console.log("✅ Connected to questions_db"));

// Express қосымшасын және порт нөмірін баптау ---
const app = express();
const PORT = process.env.PORT || 5000;

//  Middleware баптаулары ---
// CORS — барлық домендерден сұраныстарға рұқсат
// express.json() — JSON форматтағы сұраныс денелерін оқу
// express.static() — фронтенд файлдарын тікелей беру
// Лог middleware — әр сұраныстың уақыты мен жолын консольге шығару
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-password"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.static(__dirname));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.redirect("/dashboard.html");
});

//  Email верификация үшін уақытша код сақтағышы ---
// emailCodes — жадта сақталады, кілт: email, мән: { code, expiresAt }
const emailCodes = {};

//  Nodemailer транспорты ---
// Gmail SMTP арқылы email жіберу үшін баптау
// EMAIL_USER және EMAIL_PASS .env файлынан алынады
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//  Email расталу кодын жіберу ---
// POST /auth/send-code — email алады, 6 таңбалы код генерациялайды
// Email бұрын тіркелген болса 409 қайтарады
// Код 5 минут бойы жарамды, emailCodes-та сақталады
app.post("/auth/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email міндетті" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email форматы дұрыс емес" });
    }
    const checkUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (checkUser.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Бұл email тіркелген" });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    emailCodes[email] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };
    await transporter.sendMail({
      from: `"Digital Literacy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email растау коды",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border-radius: 12px; border: 1px solid #e0e0e0;">
          <h2 style="color: #6c63ff; margin-bottom: 8px;">Email растау</h2>
          <p style="color: #555; margin-bottom: 24px;">Тіркелуді аяқтау үшін төмендегі кодты енгізіңіз:</p>
          <div style="background: #f5f3ff; border-radius: 8px; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6c63ff;">
            ${code}
          </div>
          <p style="color: #999; margin-top: 20px; font-size: 13px;">Код 5 минут бойы жарамды. Егер сіз сұрамасаңыз, бұл хатты елемеңіз.</p>
        </div>
      `,
    });
    res.json({ success: true, message: "Код жіберілді" });
  } catch (error) {
    console.error("Email жіберу қатесі:", error);
    res
      .status(500)
      .json({ success: false, message: "Email жіберілмеді. Сервер қатесі." });
  }
});

//  Email растау кодын тексеру ---
// POST /auth/verify-code — email және code алады
// Код жоқ болса немесе мерзімі өтсе қате қайтарады
// Дұрыс болса emailCodes-тан жойып, success қайтарады
app.post("/auth/send-reset-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email міндетті" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email форматы дұрыс емес" });
    }
    const checkUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Бұл email тіркелмеген",
        notRegistered: true,
      });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    emailCodes[email] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };
    await transporter.sendMail({
      from: `"Digital Literacy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Құпия сөзді қалпына келтіру коды",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border-radius: 12px; border: 1px solid #e0e0e0;">
          <h2 style="color: #3b82f6; margin-bottom: 8px;">Құпия сөзді қалпына келтіру</h2>
          <p style="color: #555; margin-bottom: 24px;">Жаңа құпия сөз орнату үшін төмендегі кодты енгізіңіз:</p>
          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6;">
            ${code}
          </div>
          <p style="color: #999; margin-top: 20px; font-size: 13px;">Код 5 минут бойы жарамды. Егер сіз сұрамасаңыз, бұл хатты елемеңіз.</p>
        </div>
      `,
    });
    res.json({ success: true, message: "Код жіберілді" });
  } catch (error) {
    console.error("Reset код жіберу қатесі:", error);
    res
      .status(500)
      .json({ success: false, message: "Email жіберілмеді. Сервер қатесі." });
  }
});

app.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email және құпия сөз міндетті" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Құпия сөз кемінде 6 таңбадан тұруы керек",
      });
    }
    const checkUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (checkUser.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Пайдаланушы табылмады" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
    res.json({ success: true, message: "Құпия сөз сәтті өзгертілді" });
  } catch (error) {
    console.error("Reset password қатесі:", error);
    res.status(500).json({ success: false, message: "Сервер қатесі" });
  }
});

app.post("/auth/verify-code", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Email және код міндетті" });
  }
  const entry = emailCodes[email];
  if (!entry) {
    return res
      .status(400)
      .json({ success: false, message: "Код табылмады. Қайта жіберіңіз." });
  }
  if (Date.now() > entry.expiresAt) {
    delete emailCodes[email];
    return res
      .status(400)
      .json({ success: false, message: "Код мерзімі өтті. Қайта жіберіңіз." });
  }
  if (entry.code !== code.trim()) {
    return res.status(400).json({ success: false, message: "Код дұрыс емес" });
  }
  delete emailCodes[email];
  res.json({ success: true, message: "Email расталды" });
});

//  Барлық пайдаланушыларды қарау ---
// GET /users — auth_db-дегі users кестесінен барлық жазбаларды алу
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
    );
    res
      .status(200)
      .json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Жаңа пайдаланушы тіркеу ---
// POST /register — аты, email, құпия сөз қабылдайды
// Валидация: міндетті өрістер, email формат, құпия сөз ұзындығы (мин. 6)
// Email қайталанбауын тексереді
// bcrypt арқылы құпия сөзді шифрлайды (salt rounds: 10)
// users кестесіне жаңа жазба қосады
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, password)",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    const checkUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (checkUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, hashedPassword],
    );
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Жүйеге кіру (авторизация) ---
// POST /login — email және құпия сөз қабылдайды
// Email арқылы пайдаланушыны DB-дан іздейді
// bcrypt.compare() арқылы құпия сөзді тексереді
// Сәтті кірсе — пайдаланушы деректерін қайтарады (құпия сөзсіз)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    const result = await pool.query(
      "SELECT id, name, email, password, created_at FROM users WHERE email = $1",
      [email],
    );
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    delete user.password;
    res
      .status(200)
      .json({ success: true, message: "Login successful", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  ID бойынша пайдаланушы деректерін алу ---
// GET /users/:id — бір пайдаланушының деректерін қайтарады
// ID сандық болуын тексереді (isNaN)
// Пайдаланушы табылмаса 404 қайтарады
app.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID." });
    }
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: `User with ID ${userId} not found` });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Әкімші тексеру middleware ---
// checkAdmin() — x-admin-password хедерін немесе body-дан adminPassword өрісін тексереді
// Барлық /admin/* маршруттарына қолданылады
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function checkAdmin(req, res, next) {
  const pwd = req.headers["x-admin-password"] || req.body.adminPassword;
  if (pwd !== ADMIN_PASSWORD) {
    return res
      .status(401)
      .json({ success: false, message: "Қатынас тыйым салынған" });
  }
  next();
}

//  Сұрақтар тізімін алу (әкімші) ---
// GET /admin/questions — questions_db-дан сұрақтарды алады
// Сүзгілеу: competency, age_group, education, мәтін бойынша іздеу (ILIKE)
// checkAdmin middleware арқылы қорғалған
app.get("/admin/questions", checkAdmin, async (req, res) => {
  try {
    const { competency, age_group, education, search } = req.query;
    let query = "SELECT * FROM questions WHERE 1=1";
    const params = [];
    let i = 1;
    if (competency) {
      query += ` AND competency = $${i++}`;
      params.push(competency);
    }
    if (age_group) {
      query += ` AND age_group = $${i++}`;
      params.push(age_group);
    }
    if (education) {
      query += ` AND education = $${i++}`;
      params.push(education);
    }
    if (search) {
      query += ` AND text ILIKE $${i++}`;
      params.push(`%${search}%`);
    }
    query += " ORDER BY id DESC";
    const result = await questionsPool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Жаңа сұрақ қосу (әкімші) ---
// POST /admin/questions — жаңа сұрақ жазбасын questions кестесіне қосады
// Міндетті өрістер: text, option_a-d, correct_answer, competency
// age_group және education міндетті емес (NULL болуы мүмкін)
// correct_answer автоматты түрде бас әріпке айналдырылады
app.post("/admin/questions", checkAdmin, async (req, res) => {
  try {
    const {
      text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      competency,
      age_group,
      education,
    } = req.body;
    if (
      !text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_answer ||
      !competency
    ) {
      return res.status(400).json({
        success: false,
        message: "Барлық міндетті өрістерді толтырыңыз",
      });
    }
    const result = await questionsPool.query(
      `INSERT INTO questions (text, option_a, option_b, option_c, option_d, correct_answer, competency, age_group, education)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer.toUpperCase(),
        competency,
        age_group || null,
        education || null,
      ],
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Сұрақты өңдеу (әкімші) ---
// PUT /admin/questions/:id — бар сұрақтың барлық өрістерін жаңартады
// ID параметр арқылы беріледі
// Сұрақ табылмаса 404 қайтарады
app.put("/admin/questions/:id", checkAdmin, async (req, res) => {
  try {
    const {
      text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      competency,
      age_group,
      education,
    } = req.body;
    const result = await questionsPool.query(
      `UPDATE questions SET text=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5,
       correct_answer=$6, competency=$7, age_group=$8, education=$9
       WHERE id=$10 RETURNING *`,
      [
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer.toUpperCase(),
        competency,
        age_group || null,
        education || null,
        req.params.id,
      ],
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Сұрақ табылмады" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Сұрақты жою (әкімші) ---
// DELETE /admin/questions/:id — ID бойынша сұрақты questions кестесінен жояды
// Сұрақ табылмаса 404 қайтарады
app.delete("/admin/questions/:id", checkAdmin, async (req, res) => {
  try {
    const result = await questionsPool.query(
      "DELETE FROM questions WHERE id=$1 RETURNING id",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Сұрақ табылмады" });
    res.json({ success: true, message: "Сұрақ жойылды" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Тест сұрақтарын іріктеу ---
// POST /test/questions — пайдаланушының жас тобы мен білім деңгейіне сәйкес сұрақтарды алады
// 5 компетенция блогының әрқайсысынан 4 сұрақ кездейсоқ іріктеледі (ORDER BY RANDOM() LIMIT 4)
// NULL мәндері барлық топтарға жарамды сұрақтарды білдіреді
// Барлығы 20 сұрақ қайтарылады, ретін шайқайды
// Дұрыс жауап (correct_answer) жіберіледі — клиент тексеру үшін
app.post("/test/questions", async (req, res) => {
  try {
    const { age_group, education } = req.body;
    const competencies = [
      "information",
      "communication",
      "content",
      "safety",
      "problem",
    ];
    let allQuestions = [];
    for (const comp of competencies) {
      let query = `SELECT * FROM questions WHERE competency = $1`;
      const params = [comp];
      let i = 2;
      if (age_group) {
        query += ` AND (age_group = $${i++} OR age_group IS NULL)`;
        params.push(age_group);
      }
      if (education) {
        query += ` AND (education = $${i++} OR education IS NULL)`;
        params.push(education);
      }
      query += ` ORDER BY RANDOM() LIMIT 4`;
      const result = await questionsPool.query(query, params);
      allQuestions = allQuestions.concat(result.rows);
    }
    allQuestions.sort(() => Math.random() - 0.5);
    const sanitized = allQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      competency: q.competency,
      correct_answer: q.correct_answer,
    }));
    res.json({ success: true, count: sanitized.length, data: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Тест нәтижесін есептеу және сақтау ---
// POST /test/submit — пайдаланушы жауаптарын қабылдайды
// questions кестесінен дұрыс жауаптарды алып салыстырады
// 5 блок бойынша жеке балл есептейді
// maxScore = 20 (4 сұрақ × 5 блок, DB-ға сақталатын шикі мән)
// Фронтендте ×5 коэффициент қолданылып 100-ге дейін масштабталады
// Тіркелген пайдаланушы болса (user_id бар) — test_results кестесіне жазады
app.post("/test/submit", async (req, res) => {
  try {
    const { user_id, answers, age_group, education } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Жауаптар тізімі бос",
      });
    }

    const ids = answers.map((a) => a.question_id);
    const qResult = await questionsPool.query(
      "SELECT id, correct_answer, competency FROM questions WHERE id = ANY($1)",
      [ids],
    );
    const qMap = {};
    qResult.rows.forEach((q) => {
      qMap[q.id] = q;
    });

    let total = 0;
    let scores = {
      information: 0,
      communication: 0,
      content: 0,
      safety: 0,
      problem: 0,
    };

    answers.forEach((a) => {
      const q = qMap[a.question_id];
      if (q && a.answer === q.correct_answer) {
        total++;
        scores[q.competency]++;
      }
    });

    const maxScore = 20;

    if (user_id) {
      await questionsPool.query(
        `INSERT INTO test_results (user_id, total_score, max_score, information_score, communication_score, content_score, safety_score, problem_score, age_group, education)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          user_id,
          total,
          maxScore,
          scores.information,
          scores.communication,
          scores.content,
          scores.safety,
          scores.problem,
          age_group || null,
          education || null,
        ],
      );
    }

    res.json({ success: true, scores, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Тест тарихын алу ---
// GET /test/history/:user_id — пайдаланушының соңғы 10 тест нәтижесін қайтарады
// test_results кестесінен created_at бойынша кері тәртіппен сұрыпталады
app.get("/test/history/:user_id", async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Жарамсыз пайдаланушы ID" });
    }
    const result = await questionsPool.query(
      `SELECT * FROM test_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId],
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Соңғы тест нәтижесін алу ---
// GET /test/results/:user_id — пайдаланушының ең соңғы 1 нәтижесін қайтарады
// Нәтиже жоқ болса data: null қайтарады
app.get("/test/results/:user_id", async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Жарамсыз пайдаланушы ID" });
    }
    const result = await questionsPool.query(
      `SELECT * FROM test_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );
    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Пайдаланушылар тізімі (әкімші) ---
// GET /admin/users — auth_db-дан пайдаланушылар тізімін алады
// Әр пайдаланушының тест саны мен орташа баллын questions_db-дан біріктіреді
// statsMap арқылы екі қордың деректері біріктіріледі
app.get("/admin/users", checkAdmin, async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
    );
    const results = await questionsPool.query(
      `SELECT user_id, COUNT(*) as test_count, ROUND(AVG(total_score::float/max_score*100)) as avg_score
       FROM test_results WHERE user_id IS NOT NULL GROUP BY user_id`,
    );
    const statsMap = {};
    results.rows.forEach((r) => {
      statsMap[r.user_id] = r;
    });
    const data = users.rows.map((u) => ({
      ...u,
      test_count: parseInt(statsMap[u.id]?.test_count || 0),
      avg_score: statsMap[u.id]?.avg_score
        ? parseInt(statsMap[u.id].avg_score)
        : null,
    }));
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Жалпы статистика (әкімші) ---
// GET /admin/stats — жалпы санақтарды қайтарады:
// сұрақ саны, тест нәтижелері саны, пайдаланушы саны, орташа балл пайызы
app.get("/admin/stats", checkAdmin, async (req, res) => {
  try {
    let qCount = { rows: [{ count: 0 }] };
    let rCount = { rows: [{ count: 0 }] };
    let avgScore = { rows: [{ avg: null }] };
    let uCount = { rows: [{ count: 0 }] };

    try {
      qCount = await questionsPool.query("SELECT COUNT(*) FROM questions");
    } catch (e) {
      console.error("qCount err:", e.message);
    }
    try {
      uCount = await pool.query("SELECT COUNT(*) FROM users");
    } catch (e) {
      console.error("uCount err:", e.message);
    }
    try {
      rCount = await pool.query("SELECT COUNT(*) FROM test_results");
    } catch (e) {
      console.error("rCount err:", e.message);
    }
    try {
      avgScore = await pool.query(
        "SELECT AVG(total_score::float/max_score*100) as avg FROM test_results",
      );
    } catch (e) {
      console.error("avg err:", e.message);
    }

    res.json({
      success: true,
      questions: parseInt(qCount.rows[0].count),
      results: parseInt(rCount.rows[0].count),
      users: parseInt(uCount.rows[0].count),
      avgPercent: Math.round(avgScore.rows[0].avg || 0),
    });
  } catch (error) {
    console.error("admin/stats FATAL:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || String(error) });
  }
});

//  Сервер жұмысын тексеру ---
// GET /config — фронтендке қажетті конфигурация
app.get("/config", (req, res) => {
  res.json({
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  });
});

// GET /health — сервердің іске қосылып тұрғанын тексеру үшін
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

//  Табылмаған маршруттарды өңдеу ---
// Барлық белгісіз маршруттарға 404 қайтарады
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

//  Серверді іске қосу ---
// PORT 5000-де тыңдайды (localhost:5000)
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
