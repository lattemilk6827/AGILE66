const express = require("express");
// Create a new instance of the express router
const router = express.Router();
// Import express validator for error message validation
const { check, validationResult } = require('express-validator');
// Import custom authentication middleware
const { requireAuth } = require('./authenticate');

// Render Main Home Page
router.get("/", (req, res) => {
    res.render("index.ejs", {
        title: "Main Home Page",
        userName: req.session.userName || null // Pass the username to the template
    });
});

// Render Games Page
router.get("/games", (req, res) => {
    res.render("games.ejs", {
        title: "Games",
        userName: req.session.userName || null // Pass the username to the template
    });
});



// Render Assessment Page
router.get("/assessment", (req, res) => {
    res.render("assessment.ejs", {
        title: "Assessment",
        userName: req.session.userName || null // Pass the username to the template
    });
});


// Handle Form Submission
router.post('/submit-response',
    // Validate and sanitize inputs
    [
        check('question1').notEmpty().withMessage('Please answer Question 1'),
        check('question2').notEmpty().withMessage('Please answer Question 2'),
        check('question3').notEmpty().withMessage('Please answer Question 3'),
    ],
    (req, res) => {
        // Extract validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract form data
        const { question1, question2, question3 } = req.body;

        // Process form data (e.g., save to database)
        console.log('Question 1:', question1);
        console.log('Question 2:', question2);
        console.log('Question 3:', question3);

        // Send a JSON response
        res.json({ success: true });
    }
);

// Render all the games under each section and the selected games after category sorting
router.get("/games/category/:category", (req, res) => {
    const category = req.params.category;
    let allgamesquery = "SELECT * FROM Games";
    let params = [];

    if (category !== 'all') {
        allgamesquery += " WHERE category = ?";
        params.push(category);
    }

    db.all(allgamesquery, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        } else {
            res.json(rows);
        }
    });
});


module.exports = router;
