const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const pool = require("./db");

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

app.put("/profile", async (req, res) => {
  try {
    const { id, email, name, currentPassword, newPassword } = req.body;

    if (!name || (!id && !email)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name and user identifier are required",
        });
    }

    const userResult = id
      ? await pool.query(
          "SELECT id, name, email, password FROM users WHERE id = $1",
          [id],
        )
      : await pool.query(
          "SELECT id, name, email, password FROM users WHERE email = $1",
          [email],
        );

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = userResult.rows[0];

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is required" });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res
          .status(401)
          .json({ success: false, message: "Ағымдағы құпия сөз қате" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Жаңа құпия сөз кемінде 6 таңба болуы керек",
          });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      const result = await pool.query(
        "UPDATE users SET name = $1, password = $2 WHERE id = $3 RETURNING id, name, email, created_at",
        [name.trim(), hashed, id],
      );
      return res
        .status(200)
        .json({
          success: true,
          message: "Профиль жаңартылды",
          data: result.rows[0],
        });
    }

    const result = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at",
      [name.trim(), id],
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Профиль жаңартылды",
        data: result.rows[0],
      });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
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
