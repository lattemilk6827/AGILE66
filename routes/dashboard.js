const express = require("express");
// Create a new instance of the express router
const router = express.Router();
// Import express validator for error message validation
const { check, validationResult } = require('express-validator');
// Import custom authentication middleware
const { requireAuth } = require('./authenticate');
const bcrypt = require('bcrypt');


// Retrive Dashboard data
function fetchDashboardData(userId, callback) {
    const data = {};
    global.db.serialize(() => {
        global.db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
            if (err) {
                callback(err);
                return;
            }
            data.user = user;
            global.db.all("SELECT * FROM achievements WHERE user_id = ?", [userId], (err, achievements) => {
                if (err) {
                    callback(err);
                    return;
                }
                data.achievements = achievements;
                global.db.all("SELECT * FROM activities WHERE user_id = ?", [userId], (err, activities) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    data.activities = activities;
                    global.db.all("SELECT name FROM activities WHERE user_id = ? AND completed = 1", [userId], (err, completedActivities) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        data.completedActivities = completedActivities.map(activity => activity.name);
                        global.db.get("SELECT goals_text FROM goals WHERE user_id = ?", [userId], (err, goals) => {
                            if (err) {
                                callback(err);
                                return;
                            }
                            data.goals = goals;
                            global.db.get("SELECT goals_text FROM goals WHERE user_id = ?", [userId], (err, result) => {
                                if (err) {
                                    callback(err);
                                    return;
                                }
                                data.goalsText = result ? result.goals_text : ""; // Ensure goalsText is retrieved correctly
                                callback(null, data);
                            });
                        });
                    });
                });
            });
        });
    });
}

// Render Dashboard Page with dynamic data
router.get("/dashboard", requireAuth, (req, res) => {
    fetchDashboardData(req.session.userId, (err, data) => {
        if (err) {
            res.status(500).send("Error fetching dashboard data");
            return;
        }
        res.render("dashboard.ejs", {
            title: "Dashboard",
            userName: req.session.userName || null,
            user: data.user,
            achievements: data.achievements,
            activities: data.activities,
            completedActivities: data.completedActivities,
            goals: data.goals,
            goalsText: data.goalsText
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
        const updatedGoalsText = existingGoalsText + "\n" + newGoalText;

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

// Route to handle the deletion of a goal
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

        if (row) {
            let goalsArray = row.goals_text.split("\n").filter(goal => goal.trim().length > 0);
            if (goalIndex >= 0 && goalIndex < goalsArray.length) {
                goalsArray.splice(goalIndex, 1);
                const updatedGoalsText = goalsArray.join("\n");

                const updateGoalsQuery = "REPLACE INTO goals (user_id, goals_text) VALUES (?, ?)";
                global.db.run(updateGoalsQuery, [userId, updatedGoalsText], function(err) {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).send("Error updating goals");
                    }
                    console.log("Goal deleted successfully, rows affected:", this.changes);

                    res.redirect("/dashboard"); // Redirect to the dashboard
                });
            } else {
                res.status(400).send("Invalid goal index");
            }
        } else {
            res.status(400).send("No goals found for the user");
        }
    });
});


module.exports = router;
