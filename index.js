const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const pool = require("./db");

const { Pool } = require("pg");
const questionsPool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.QUESTIONS_DB_NAME || "questions_db",
  password: process.env.DB_PASSWORD || "1234",
  port: process.env.DB_PORT || 5432,
});
questionsPool.on("connect", () => console.log("✅ Connected to questions_db"));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.static(__dirname));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/users", async (req, res) => {
  try {
    const query = `
            SELECT id, name, email, created_at 
            FROM users 
            ORDER BY created_at DESC
        `;

    const result = await pool.query(query);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users from database",
      error: error.message,
    });
  }
});

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
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
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
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password, created_at FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    delete user.password;
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in user",
      error: error.message,
    });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID. ID must be a number.",
      });
    }
    const query = `
            SELECT id, name, email, created_at 
            FROM users 
            WHERE id = $1
        `;

    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`,
      });
    }
    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user from database",
      error: error.message,
    });
  }
});

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

app.get("/admin/questions", checkAdmin, async (req, res) => {
  try {
    const { competency, age_group, education, field, search } = req.query;
    let query = "SELECT * FROM questions WHERE 1=1";
    const params = [];
    let i = 1;
    if (competency) {
      query += ` AND competency = $${i++}`;
      params.push(competency);
    }
    if (age_group) {
      query += ` AND (age_group = $${i++} OR age_group = 'all')`;
      params.push(age_group);
    }
    if (education) {
      query += ` AND (education = $${i++} OR education = 'all')`;
      params.push(education);
    }
    if (field) {
      query += ` AND (field = $${i++} OR field = 'all')`;
      params.push(field);
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
      field,
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Барлық міндетті өрістерді толтырыңыз",
        });
    }
    const result = await questionsPool.query(
      `INSERT INTO questions (text, option_a, option_b, option_c, option_d, correct_answer, competency, age_group, education, field)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer.toUpperCase(),
        competency,
        age_group || "all",
        education || "all",
        field || "all",
      ],
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
      field,
    } = req.body;
    const result = await questionsPool.query(
      `UPDATE questions SET text=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5,
       correct_answer=$6, competency=$7, age_group=$8, education=$9, field=$10
       WHERE id=$11 RETURNING *`,
      [
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer.toUpperCase(),
        competency,
        age_group || "all",
        education || "all",
        field || "all",
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

app.post("/test/questions", async (req, res) => {
  try {
    const { age_group, education, field } = req.body;
    const competencies = [
      "information",
      "communication",
      "content",
      "safety",
      "problem",
    ];
    let allQuestions = [];
    for (const comp of competencies) {
      const result = await questionsPool.query(
        `SELECT * FROM questions
         WHERE competency = $1
         AND (age_group = $2 OR age_group = 'all')
         AND (education = $3 OR education = 'all')
         AND (field = $4 OR field = 'all')
         ORDER BY RANDOM() LIMIT 4`,
        [comp, age_group || "all", education || "all", field || "all"],
      );
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
    }));
    res.json({ success: true, count: sanitized.length, data: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/test/submit", async (req, res) => {
  try {
    const { user_id, answers, age_group, education, field } = req.body;
    const ids = answers.map((a) => a.question_id);
    const qResult = await questionsPool.query(
      "SELECT id, correct_answer, competency FROM questions WHERE id = ANY($1)",
      [ids],
    );
    const qMap = {};
    qResult.rows.forEach((q) => {
      qMap[q.id] = q;
    });
    let total = 0,
      scores = {
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
    const result = await questionsPool.query(
      `INSERT INTO test_results (user_id, total_score, max_score, information_score, communication_score, content_score, safety_score, problem_score, age_group, education, field)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        user_id || null,
        total,
        answers.length,
        scores.information,
        scores.communication,
        scores.content,
        scores.safety,
        scores.problem,
        age_group,
        education,
        field,
      ],
    );
    res.json({ success: true, data: result.rows[0], scores, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/admin/stats", checkAdmin, async (req, res) => {
  try {
    const qCount = await questionsPool.query("SELECT COUNT(*) FROM questions");
    const rCount = await questionsPool.query(
      "SELECT COUNT(*) FROM test_results",
    );
    const avgScore = await questionsPool.query(
      "SELECT AVG(total_score::float/max_score*100) as avg FROM test_results",
    );
    res.json({
      success: true,
      questions: parseInt(qCount.rows[0].count),
      results: parseInt(rCount.rows[0].count),
      avgPercent: Math.round(avgScore.rows[0].avg || 0),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
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
