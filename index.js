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

app.get("/admin/stats", checkAdmin, async (req, res) => {
  try {
    const qCount = await questionsPool.query("SELECT COUNT(*) FROM questions");
    const rCount = await questionsPool.query(
      "SELECT COUNT(*) FROM test_results",
    );
    const uCount = await pool.query("SELECT COUNT(*) FROM users");
    const avgScore = await questionsPool.query(
      "SELECT AVG(total_score::float/max_score*100) as avg FROM test_results",
    );
    res.json({
      success: true,
      questions: parseInt(qCount.rows[0].count),
      results: parseInt(rCount.rows[0].count),
      users: parseInt(uCount.rows[0].count),
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
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
