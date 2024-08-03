const express = require("express");
// Create a new instance of the express router
const router = express.Router();
// Import bcrypt for password hashing
const bcrypt = require('bcrypt'); 
// Import express validator for error message validation
const { check, validationResult } = require('express-validator'); 

// Middleware for authentication function
function requireAuth(req, res, next) {
    if (req.session.loggedIn) {
        // Proceed to next route handler if authenticated
        next();
    } else {
        // Store the original request URL in the session to allow user to see the respective pages after the logged in action
        req.session.returnTo = req.originalUrl;
        // Redirect to login page if not authenticated
        res.redirect('/login');
    }
}
// Route to display the login page
router.get("/login", (req, res) => {
    // Show login page with no error messages initially
    res.render("login.ejs", { error: [] });
});

// Route to handle login form submission
router.post("/login", [
    // Validation of email and password fields using 'check' method
    check('email').isEmail().withMessage('Enter a valid email'),
    check('password').notEmpty().withMessage('Password is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Show the errors if there are validation errors with error messages
        return res.render("login.ejs", { error: errors.array() });
    }

    // Extracting email and password from the request body
    const { email, password } = req.body; 
    // SQL query to find userid by email
    const query = "SELECT * FROM Users WHERE email = ?"; 

    // Execute the query to find the user
    global.db.get(query, [email], (err, user) => {
        if (err) {
            // Show any errors if database is not updated properly 
            return res.render("login.ejs", { error: [{ msg: 'Database error' }] });
        }
        if (!user) {
            // If no user is found for that log in details , an error message will appear
            return res.render("login.ejs", { error: [{ msg: 'Invalid email or password' }] });
        }

        // Compare the user input password with the hashed password stored in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                // Show error if not updated properly for password comparison
                return res.render("login.ejs", { error: [{ msg: 'Error during password comparison' }] });
            }
            if (!isMatch) { 
                // If the password does not match, error message will appear 
                return res.render("login.ejs", { error: [{ msg: 'Invalid email or password' }] });
            }

            // If the password matches, session variables are set for authentication
            req.session.loggedIn = true;
            req.session.userId = user.id;
            req.session.userName = user.user_name; // Store the username in the session
           
            // Allowing after logged in action to give url of that page the user wants to see after authentication NOT redirecting to a specific page
            // Redirect to the originally requested URL or home page if no original URL
             const redirectTo = req.session.returnTo || '/';
             delete req.session.returnTo; // Clear the returnTo value from session
             res.redirect(redirectTo);
        });
    });
});



// Route to display the registration page
router.get("/register", (req, res) => {
    // Show the registration page with no error messages initially
    res.render("register.ejs", { error: [] });
});

// Route to handle registration form submission if no log in details
router.post("/register", [
    // Validation of username, email and password fields using check method
    check('user_name').notEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Enter a valid email'),
    check('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character (!@#$%^&*)')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, registration page shows error messages according to check method
        return res.render("register.ejs", { error: errors.array() });
    }

    // Extract user details from the request body
    const { user_name, email, password } = req.body; 
    // SQL query to check if the email is already registered
    const query = "SELECT * FROM Users WHERE email = ?"; 

    // Execute the query to check if the email is already registered
    global.db.get(query, [email], (err, existingUser) => {
        if (err) {
            // If database not populated correctly show error
            return res.render("register.ejs", { error: [{ msg: 'Database error' }] });
        }
        if (existingUser) {
            // If the email is already registered, show an error message
            return res.render("register.ejs", { error: [{ msg: 'Email already registered' }] });
        }

        // Hash the password before storing it in the database
        // cost factor 10 is chosen - number of iterations used in the hashing process allowing for more rounds making algorithm run longer, making it more resistant to brute-force attacks
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                // Show error if database disrupts during password hashing
                return res.render("register.ejs", { error: [{ msg: 'Error during password hashing' }] });
            }

            // SQL query to insert the new user account details into the database
            const newUserQuery = "INSERT INTO Users (user_name, email, password) VALUES (?, ?, ?)";
            // Execute the query to insert the new user
            global.db.run(newUserQuery, [user_name, email, hash], function (err) {
                if (err) {
                    // Show error during new user insertion of data if any
                    return res.render("register.ejs", { error: [{ msg: 'Error inserting user into database' }] });
                }

                // Redirect the new user to the login page after registration is successful
                res.redirect('/login');
            });
        });
    });
});



module.exports = {
    requireAuth,
    router
};
