const express = require("express");
// Create a new instance of the express router
const router = express.Router();
// Import custom authentication middleware
const { requireAuth } = require('./authenticate');
const bcrypt = require('bcrypt');

// Dashboard Route: Displays the user dashboard after successful authentication
router.get("/dashboard", requireAuth, (req, res) => {
    const userId = req.session.userId;
    // SQL query to fetch the user's games and their progress
    const query = `
        SELECT g.id, g.title, g.image, g.description, g.category, g.section, 
               COALESCE(gp.elapsed_minutes, 0) AS elapsed_minutes, 
               ROUND((COALESCE(gp.elapsed_minutes, 0) / 15.0) * 100, 2) AS progress_percentage
        FROM Games g
        LEFT JOIN game_progress gp ON g.id = gp.game_id AND gp.user_id = ?
    `;

    // SQL query to fetch user-specific goals
    const goalsQuery = `SELECT goals_text FROM goals WHERE user_id = ?`;

    // Execute game query
    global.db.all(query, [userId], (err, games) => {
        if (err) {
            console.error("Database error fetching games:", err);
            return res.status(500).send("Internal Server Error");
        }

        // Execute goals query and render dashboard view
        global.db.get(goalsQuery, [userId], (err, goal) => {
            if (err) {
                console.error("Database error fetching goals:", err);
                return res.status(500).send("Internal Server Error");
            }

            // Render the dashboard with games and goals information
            res.render("dashboard", {
                userName: req.session.userName,
                games: games,
                goalsText: goal ? goal.goals_text : ''
            });
        });
    });
});

// Edit Profile Route: Displays the profile edit form
router.get("/edit-profile", requireAuth, (req, res) => {
    // Render the edit-profile view, passing the current username to populate the form
    res.render("edit-profile.ejs", {
        userName: req.session.userName
    });
});

// Profile Update Handler: Processes profile update submissions
router.post("/update-profile", requireAuth, (req, res) => {
    const { username, password } = req.body;
    // Hash the new password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send("Failed to update user password.");
        }

        // SQL query to update the user's name and password
        const updateQuery = "UPDATE Users SET user_name = ?, password = ? WHERE id = ?";
        global.db.run(updateQuery, [username, hash, req.session.userId], function(err) {
            if (err) {
                console.error("Error updating user profile:", err);
                return res.status(500).send("Error updating profile");
            }
            // Update the session with the new username
            req.session.userName = username;
            // Redirect to the dashboard upon successful update
            res.redirect("/dashboard");
        });
    });
});

// Goals Update Route: Handles submissions for updating user goals
router.post("/update-goals", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const goalsText = req.body.goals;

    // SQL query to replace existing goals with new text
    const updateGoalsQuery = "REPLACE INTO goals (user_id, goals_text) VALUES (?, ?)";
    global.db.run(updateGoalsQuery, [userId, goalsText], function(err) {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error updating goals");
        }
        // Log the success and affected rows for debugging
        console.log("Goals updated successfully, rows affected:", this.changes);
        // Redirect back to the dashboard
        res.redirect("/dashboard");
    });
});

// Add More Goals Route: Handles submissions for adding new goals
router.post("/add-more-goals", requireAuth, (req, res) => {
    const userId = req.session.userId;
    const newGoalText = req.body.newGoal;

    // SQL query to fetch existing goals
    const getExistingGoalsQuery = "SELECT goals_text FROM goals WHERE user_id = ?";
    global.db.get(getExistingGoalsQuery, [userId], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error getting existing goals");
        }

        // Prepare updated goals text by appending the new goal
        let existingGoalsText = row ? row.goals_text : "";
        const updatedGoalsText = newGoalText + "\n" + existingGoalsText;

        // SQL query to update the goals
        const updateGoalsQuery = "REPLACE INTO goals (user_id, goals_text) VALUES (?, ?)";
        global.db.run(updateGoalsQuery, [userId, updatedGoalsText], function(err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).send("Error updating goals");
            }
            // Log the success and redirect to the dashboard
            console.log("Goals updated successfully, rows affected:", this.changes);
            res.redirect("/dashboard");
        });
    });
});

// Route to handle deleting a goal
router.post("/delete-goal", requireAuth, (req, res) => {
    const userId = req.session.userId; // Retrieve user ID from session
    const goalIndex = parseInt(req.body.goalIndex, 10); // Convert goal index from request to integer

    console.log("Deleting goal for user:", userId, "at index:", goalIndex);

    // SQL query to retrieve current goals text for the user
    const getExistingGoalsQuery = "SELECT goals_text FROM goals WHERE user_id = ?";
    global.db.get(getExistingGoalsQuery, [userId], (err, row) => {
        if (err) {
            console.error("Database error:", err); // Log and handle database errors
            return res.status(500).send("Error getting existing goals");
        }

        // Split existing goals into an array by newline
        let existingGoalsText = row ? row.goals_text : "";
        const goalsArray = existingGoalsText.split("\n");
        // Remove the goal at the specified index if it is within bounds
        if (goalIndex >= 0 && goalIndex < goalsArray.length) {
            goalsArray.splice(goalIndex, 1);
        }
        // Join the array back into a single string with updated goals
        const updatedGoalsText = goalsArray.join("\n");

        // SQL query to update the goals text in the database
        const updateGoalsQuery = "REPLACE INTO goals (user_id, goals_text) VALUES (?, ?)";
        global.db.run(updateGoalsQuery, [userId, updatedGoalsText], function(err) {
            if (err) {
                console.error("Database error:", err); // Log and handle database errors
                return res.status(500).send("Error updating goals");
            }
            // Log successful update and affected rows for debugging
            console.log("Goals updated successfully, rows affected:", this.changes);

            // Redirect the user back to the dashboard after updating the goals
            res.redirect("/dashboard");
        });
    });
});


module.exports = router;
