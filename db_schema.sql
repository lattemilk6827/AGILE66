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

-- Forums Table
CREATE TABLE IF NOT EXISTS Forum (
    forum_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    forum_title VARCHAR(255),
    forum_subtitle VARCHAR(255),
    forum_body TEXT,
    forum_likes INTEGER DEFAULT 0,
    forum_publishedtimestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forum_category VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
-- Dummy Data for Forum Table
INSERT INTO Forum (forum_id, user_id, forum_title, forum_subtitle, forum_body, forum_likes, forum_publishedtimestamp, forum_category) VALUES 
(1, 1, 'Title 1', 'Subtitle 1', 'This is the body of the first forum post.', 10, CURRENT_TIMESTAMP, 'General Discussion'),
(2, 1, 'Title 2', 'Subtitle 2', 'This is the body of the second forum post.', 5, CURRENT_TIMESTAMP, 'Feedback'),
(3, 1, 'Title 3', 'Subtitle 3', 'This is the body of the third forum post.', 8, CURRENT_TIMESTAMP, 'News'),
(4, 1, 'Title 4', 'Subtitle 4', 'This is the body of the fourth forum post.', 15, CURRENT_TIMESTAMP, 'Announcements'),
(5, 1, 'Title 5', 'Subtitle 5', 'This is the body of the fifth forum post.', 7, CURRENT_TIMESTAMP, 'General Discussion'),
(6, 1, 'Title 6', 'Subtitle 6', 'This is the body of the sixth forum post.', 12, CURRENT_TIMESTAMP, 'Feedback'),
(7, 1, 'Title 7', 'Subtitle 7', 'This is the body of the seventh forum post.', 9, CURRENT_TIMESTAMP, 'News'),
(8, 1, 'Title 8', 'Subtitle 8', 'This is the body of the eighth forum post.', 20, CURRENT_TIMESTAMP, 'Announcements'),
(9, 1, 'Title 9', 'Subtitle 9', 'This is the body of the ninth forum post.', 11, CURRENT_TIMESTAMP, 'General Discussion'),
(10, 1, 'Title 10', 'Subtitle 10', 'This is the body of the tenth forum post.', 3, CURRENT_TIMESTAMP, 'Feedback');

-- Forums Comments Table
CREATE TABLE IF NOT EXISTS Forum_Comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    forum_id INTEGER,
    commenter_name TEXT NOT NULL,
    comment_text TEXT,
    comment_likes INTEGER DEFAULT 0,
    comment_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES Forum(forum_id)
);
-- Dummy Data for Forum_Comments Table
INSERT INTO Forum_Comments (comment_id, forum_id, commenter_name, comment_text, comment_likes, comment_timestamp) VALUES 
(1, 1, 'John Doe', 'This is a comment on the first forum post.', 3, CURRENT_TIMESTAMP),
(2, 1, 'Jane Doe', 'This is another comment on the first forum post.', 2, CURRENT_TIMESTAMP),
(3, 2, 'Alice', 'This is a comment on the second forum post.', 5, CURRENT_TIMESTAMP),
(4, 3, 'Bob', 'This is a comment on the third forum post.', 1, CURRENT_TIMESTAMP),
(5, 4, 'Charlie', 'This is a comment on the fourth forum post.', 4, CURRENT_TIMESTAMP),
(6, 4, 'Eve', 'This is another comment on the fourth forum post.', 6, CURRENT_TIMESTAMP),
(7, 5, 'Frank', 'This is a comment on the fifth forum post.', 7, CURRENT_TIMESTAMP),
(8, 6, 'Grace', 'This is a comment on the sixth forum post.', 5, CURRENT_TIMESTAMP),
(9, 7, 'Heidi', 'This is a comment on the seventh forum post.', 3, CURRENT_TIMESTAMP),
(10, 8, 'Ivan', 'This is a comment on the eighth forum post.', 9, CURRENT_TIMESTAMP),
(11, 9, 'Judy', 'This is a comment on the ninth forum post.', 2, CURRENT_TIMESTAMP),
(12, 10, 'Mallory', 'This is a comment on the tenth forum post.', 4, CURRENT_TIMESTAMP),
(13, 1, 'Niaj', 'Another comment on the first forum post.', 5, CURRENT_TIMESTAMP),
(14, 2, 'Olivia', 'Another comment on the second forum post.', 6, CURRENT_TIMESTAMP),
(15, 3, 'Peggy', 'Another comment on the third forum post.', 1, CURRENT_TIMESTAMP);

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

CREATE TABLE IF NOT EXISTS Responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question1 INTEGER,
    question2 INTEGER,
    question3 INTEGER,
    question4 INTEGER,
    question5 INTEGER,
    responseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);



-- Insert sample data into Games table
INSERT OR REPLACE INTO Games (id, title, image, description, category, section, progress, user_id) VALUES 
(1, 'Mind Game 1', 'path/to/mindgame1.png', 'Description for Mind Game 1', 'easy', 'mind', 0, 1),
(2, 'Mind Game 2', 'path/to/mindgame2.png', 'Description for Mind Game 2', 'easy', 'mind', 0, 1),
(3, 'Mind Game 3', 'path/to/mindgame3.png', 'Description for Mind Game 3', 'medium', 'mind', 0, 1),
(4, 'Mind Game 4', 'path/to/mindgame4.png', 'Description for Mind Game 4', 'medium', 'mind', 0, 1),
(5, 'Mind Game 5', 'path/to/mindgame5.png', 'Description for Mind Game 5', 'difficult', 'mind', 0, 1),
(6, 'Mind Game 6', 'path/to/mindgame6.png', 'Description for Mind Game 6', 'difficult', 'mind', 0, 1),
(7, 'Relaxation Game 1', 'path/to/relaxationgame1.png', 'Description for Relaxation Game 1', 'easy', 'relaxation', 0, 1),
(8, 'Relaxation Game 2', 'path/to/relaxationgame2.png', 'Description for Relaxation Game 2', 'easy', 'relaxation', 0, 1),
(9, 'Relaxation Game 3', 'path/to/relaxationgame3.png', 'Description for Relaxation Game 3', 'medium', 'relaxation', 0, 1),
(10, 'Relaxation Game 4', 'path/to/relaxationgame4.png', 'Description for Relaxation Game 4', 'medium', 'relaxation', 0, 1),
(11, 'Relaxation Game 5', 'path/to/relaxationgame5.png', 'Description for Relaxation Game 5', 'difficult', 'relaxation', 0, 1),
(12, 'Relaxation Game 6', 'path/to/relaxationgame6.png', 'Description for Relaxation Game 6', 'difficult', 'relaxation', 0, 1),
(13, 'Educational Game 1', 'path/to/educationalgame1.png', 'Description for Educational Game 1', 'easy', 'educational', 0, 1),
(14, 'Educational Game 2', 'path/to/educationalgame2.png', 'Description for Educational Game 2', 'easy', 'educational', 0, 1),
(15, 'Educational Game 3', 'path/to/educationalgame3.png', 'Description for Educational Game 3', 'medium', 'educational', 0, 1),
(16, 'Educational Game 4', 'path/to/educationalgame4.png', 'Description for Educational Game 4', 'medium', 'educational', 0, 1),
(17, 'Educational Game 5', 'path/to/educationalgame5.png', 'Description for Educational Game 5', 'difficult', 'educational', 0, 1),
(18, 'Educational Game 6', 'path/to/educationalgame6.png', 'Description for Educational Game 6', 'difficult', 'educational', 0, 1);

-- Save time progress for games to show in progress bars
CREATE TABLE IF NOT EXISTS game_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    elapsed_minutes INTEGER DEFAULT 0,
    UNIQUE(game_id, user_id)
);



COMMIT;
