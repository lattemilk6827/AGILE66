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

// Render Forum Page
router.get("/forum", (req, res) => {
    res.render("forum.ejs", {
        title: "Forum",
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
