const express = require("express");
// Create a new instance of the express router
const router = express.Router();
// Import express validator for error message validation
const { check, validationResult } = require('express-validator');
// Import custom authentication middleware
const { requireAuth } = require('./authenticate');
const bcrypt = require('bcrypt');


// Route to display the dashboard
router.get("/dashboard", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const query = `
        SELECT g.id, g.title, g.image, g.description, g.category, g.section, 
               COALESCE(gp.elapsed_minutes, 0) AS elapsed_minutes, 
               ROUND((COALESCE(gp.elapsed_minutes, 0) / 15.0) * 100, 2) AS progress_percentage
        FROM Games g
        LEFT JOIN game_progress gp ON g.id = gp.game_id AND gp.user_id = ?
    `;

    const achievementsQuery = `SELECT * FROM achievements WHERE user_id = ?`;
    const goalsQuery = `SELECT goals_text FROM goals WHERE user_id = ?`;

    global.db.all(query, [userId], (err, games) => {
        if (err) {
            console.error("Database error fetching games:", err);
            return res.status(500).send("Internal Server Error");
        }

        global.db.all(achievementsQuery, [userId], (err, achievements) => {
            if (err) {
                console.error("Database error fetching achievements:", err);
                return res.status(500).send("Internal Server Error");
            }

            global.db.get(goalsQuery, [userId], (err, goal) => {
                if (err) {
                    console.error("Database error fetching goals:", err);
                    return res.status(500).send("Internal Server Error");
                }

                res.render("dashboard", {
                    userName: req.session.userName,
                    games: games,
                    achievements: achievements,
                    goalsText: goal ? goal.goals_text : ''
                });
            });
        });
    });
});


// Route to display the Edit Profile form
router.get("/edit-profile", requireAuth, (req, res) => {
    res.render("edit-profile.ejs", {
        userName: req.session.userName // Pass the current username to the template
    });
});


// Route to handle the profile update form submission
router.post("/update-profile", requireAuth, (req, res) => {
    const { username, password } = req.body;
    // Hash the new password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send("Failed to update user password.");
        }

        const updateQuery = "UPDATE Users SET user_name = ?, password = ? WHERE id = ?";
        global.db.run(updateQuery, [username, hash, req.session.userId], function(err) {
            if (err) {
                console.error("Error updating user profile:", err);
                return res.status(500).send("Error updating profile");
            }
            req.session.userName = username; // Update session with new username
            res.redirect("/dashboard"); // Redirect to the dashboard after updating
        });
    });
});



// Route to handle the updating of goals
router.post("/update-goals", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const goalsText = req.body.goals;

    console.log("Updating goals for user:", userId, "with text:", goalsText);

    const updateGoalsQuery = "REPLACE INTO goals (user_id, goals_text) VALUES (?, ?)";
    global.db.run(updateGoalsQuery, [userId, goalsText], function(err) {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error updating goals");
        }
        console.log("Goals updated successfully, rows affected:", this.changes);

        res.redirect("/dashboard"); // Redirect to the dashboard
    });
});

// Route to handle the adding of more goals
router.post("/add-more-goals", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const newGoalText = req.body.newGoal;

    console.log("Adding new goal for user:", userId, "with text:", newGoalText);

    const getExistingGoalsQuery = "SELECT goals_text FROM goals WHERE user_id = ?";
    global.db.get(getExistingGoalsQuery, [userId], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error getting existing goals");
        }

        let existingGoalsText = row ? row.goals_text : "";
        const updatedGoalsText = newGoalText + "\n" + existingGoalsText;

        const updateGoalsQuery = "REPLACE INTO goals (user_id, goals_text) VALUES (?, ?)";
        global.db.run(updateGoalsQuery, [userId, updatedGoalsText], function(err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).send("Error updating goals");
            }
            console.log("Goals updated successfully, rows affected:", this.changes);

            res.redirect("/dashboard"); // Redirect to the dashboard
        });
    });
});

// Route to handle deleting a goal
router.post("/delete-goal", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const goalIndex = parseInt(req.body.goalIndex, 10);

    console.log("Deleting goal for user:", userId, "at index:", goalIndex);

    const getExistingGoalsQuery = "SELECT goals_text FROM goals WHERE user_id = ?";
    global.db.get(getExistingGoalsQuery, [userId], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error getting existing goals");
        }

        let existingGoalsText = row ? row.goals_text : "";
        const goalsArray = existingGoalsText.split("\n");
        if (goalIndex >= 0 && goalIndex < goalsArray.length) {
            goalsArray.splice(goalIndex, 1);
        }
        const updatedGoalsText = goalsArray.join("\n");

        const updateGoalsQuery = "REPLACE INTO goals (user_id, goals_text) VALUES (?, ?)";
        global.db.run(updateGoalsQuery, [userId, updatedGoalsText], function(err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).send("Error updating goals");
            }
            console.log("Goals updated successfully, rows affected:", this.changes);

            res.redirect("/dashboard"); // Redirect to the dashboard
        });
    });
});


module.exports = router;
