const express = require("express");
// Create a new instance of the express router
const router = express.Router();
// Import express validator for error message validation
const { check, validationResult } = require('express-validator');


// Render Main Home Page
router.get("/", (req, res) => {
    res.render("index.ejs", {
        title: "Main Home Page",
        userName: req.session.userName || null // Pass the username to the template
    });
});

// Render Privacy Policy Page
router.get("/policy", (req, res) => {
    res.render("policy.ejs", {
        title: "Policy",
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

// Render Assessment Page
router.get("/past-responses", (req, res) => {
    res.render("past-responses.ejs", {
        title: "past-responses",
        userName: req.session.userName || null // Pass the username to the template
    });
});

module.exports = router;
