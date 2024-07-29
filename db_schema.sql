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
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    badgeImage TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Activities Table
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    progress INTEGER,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Goals Table
CREATE TABLE goals (
    user_id INTEGER PRIMARY KEY,
    goals_text TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Emotions Table
CREATE TABLE Emotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    emotion TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

COMMIT;
