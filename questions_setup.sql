CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  competency VARCHAR(50) NOT NULL CHECK (competency IN ('information','communication','content','safety','problem')),
  age_group VARCHAR(20) CHECK (age_group IN ('10-18','19-35','36-60','60+')),
  education VARCHAR(30) CHECK (education IN ('Орта мектеп','Колледж','Жоғары')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,  
  total_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  information_score INTEGER DEFAULT 0,
  communication_score INTEGER DEFAULT 0,
  content_score INTEGER DEFAULT 0,
  safety_score INTEGER DEFAULT 0,
  problem_score INTEGER DEFAULT 0,
  age_group VARCHAR(20),
  education VARCHAR(30),
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL
);