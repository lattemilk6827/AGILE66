// Express framework for building web applications
const express = require('express'); 
const app = express(); 
// Define the port number on which the server will run
const port = 3000;
// Middleware for parsing request bodies
const bodyParser = require('body-parser'); 
const sqlite3 = require('sqlite3').verbose(); 
const fs = require('fs'); 
// Path module for working with file and directory paths
const path = require('path'); 
// Session middleware for managing user sessions
const session = require('express-session'); 
// Dotenv module for loading environment variables from a .env file
const dotenv = require('dotenv'); 
dotenv.config();

// Set up express, bodyparser and EJS
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


// Set up express-session
// Set the cookie.secure flag to true in production to ensure cookies are only sent over HTTPS
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));


// Set up SQLite
const dbFile = path.join(__dirname, 'database.db');
const dbExists = fs.existsSync(dbFile);

global.db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } else {
        console.log("Database connected");
        // tell SQLite to pay attention to foreign key constraints
        global.db.run("PRAGMA foreign_keys=ON"); 
        
        // If the database doesn't exist, initialise it
        if (!dbExists) {
            setUPDatabase();
        }
    }
});

// Function to initialise the database
function setUPDatabase() {
    const initSQL = fs.readFileSync(path.join(__dirname, 'db_schema.sql'), 'utf8');
    global.db.exec(initSQL, (err) => {
        if (err) {
            console.error("Failed to initialise the database:", err);
        } else {
            console.log("Database initialised");
        }
    });
}

// Serve static files from the public directory
app.use(express.static('public'));

// Import and use routes
const authRoutes = require('./routes/authenticate');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const forumRoutes = require('./routes/forum');
const gameRoutes = require('./routes/games');
const assessmentRoutes = require('./routes/assessment');


app.use('/', authRoutes.router);
app.use('/', usersRoutes);
app.use('/', dashboardRoutes);
app.use('/', forumRoutes);
app.use('/', gameRoutes);
app.use('/', assessmentRoutes);

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
