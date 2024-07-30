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

-- Create Games table
CREATE TABLE IF NOT EXISTS Games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT,
    description TEXT,
    category TEXT,
    section TEXT,
    progress INTEGER DEFAULT 0,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Questionnaire Responses table
CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question_id INTEGER,
    response_value INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);


-- Insert sample data into Games table
INSERT INTO Games (title, image, description, category, section, progress, user_id) VALUES 
('Mind Game 1', 'path/to/mindgame1.png', 'Description for Mind Game 1', 'easy', 'mind', 0, 1),
('Mind Game 2', 'path/to/mindgame2.png', 'Description for Mind Game 2', 'easy', 'mind', 0, 1),
('Mind Game 3', 'path/to/mindgame3.png', 'Description for Mind Game 3', 'medium', 'mind', 0, 1),
('Mind Game 4', 'path/to/mindgame4.png', 'Description for Mind Game 4', 'medium', 'mind', 0, 1),
('Mind Game 5', 'path/to/mindgame5.png', 'Description for Mind Game 5', 'difficult', 'mind', 0, 1),
('Mind Game 6', 'path/to/mindgame6.png', 'Description for Mind Game 6', 'difficult', 'mind', 0, 1),
('Relaxation Game 1', 'path/to/relaxationgame1.png', 'Description for Relaxation Game 1', 'easy', 'relaxation', 0, 1),
('Relaxation Game 2', 'path/to/relaxationgame2.png', 'Description for Relaxation Game 2', 'easy', 'relaxation', 0, 1),
('Relaxation Game 3', 'path/to/relaxationgame3.png', 'Description for Relaxation Game 3', 'medium', 'relaxation', 0, 1),
('Relaxation Game 4', 'path/to/relaxationgame4.png', 'Description for Relaxation Game 4', 'medium', 'relaxation', 0, 1),
('Relaxation Game 5', 'path/to/relaxationgame5.png', 'Description for Relaxation Game 5', 'difficult', 'relaxation', 0, 1),
('Relaxation Game 6', 'path/to/relaxationgame6.png', 'Description for Relaxation Game 6', 'difficult', 'relaxation', 0, 1),
('Educational Game 1', 'path/to/educationalgame1.png', 'Description for Educational Game 1', 'easy', 'educational', 0, 1),
('Educational Game 2', 'path/to/educationalgame2.png', 'Description for Educational Game 2', 'easy', 'educational', 0, 1),
('Educational Game 3', 'path/to/educationalgame3.png', 'Description for Educational Game 3', 'medium', 'educational', 0, 1),
('Educational Game 4', 'path/to/educationalgame4.png', 'Description for Educational Game 4', 'medium', 'educational', 0, 1),
('Educational Game 5', 'path/to/educationalgame5.png', 'Description for Educational Game 5', 'difficult', 'educational', 0, 1),
('Educational Game 6', 'path/to/educationalgame6.png', 'Description for Educational Game 6', 'difficult', 'educational', 0, 1);

COMMIT;
