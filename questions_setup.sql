CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  competency VARCHAR(50) NOT NULL CHECK (competency IN ('information','communication','content','safety','problem')),
  age_group VARCHAR(20) CHECK (age_group IN ('10-18','18-25','26-35','36-50','50+','all')),
  education VARCHAR(30) CHECK (education IN ('Орта','Техникалық','Жоғары','Магистр','all')),
  field VARCHAR(30) CHECK (field IN ('Білім','Медицина','IT','Бизнес','Мемлекет','Студент','Басқа','all')),
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
  field VARCHAR(30),
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL
);