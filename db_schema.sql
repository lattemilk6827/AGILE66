PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Create Users table if it does not exist
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Insert sample data into Users table
INSERT OR IGNORE INTO Users (id, user_name, email, password) VALUES (1, 'John Doe', 'john.doe@example.com', 'password123');

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    badgeImage TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    progress INTEGER,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    user_id INTEGER PRIMARY KEY,
    goals_text TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Survey Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL
);

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question_id INTEGER,
    response INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id),
    FOREIGN KEY(question_id) REFERENCES survey_questions(id)
);

-- Survey Results Table
CREATE TABLE IF NOT EXISTS survey_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

COMMIT;
