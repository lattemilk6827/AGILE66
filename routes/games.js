// Import the necessary modules
const express = require("express");
const router = express.Router(); // Create a new instance of the express router
const { requireAuth } = require("./authenticate"); // Import custom authentication middleware

// Route to render the games page based on user's last assessment result
router.get("/games", (req, res) => {
    const userId = req.session.userId; // Retrieve the user's ID from the session

    // Query to fetch the latest assessment score for the user
    const assessmentQuery = "SELECT score FROM assessments WHERE userId = ? ORDER BY createdAt DESC LIMIT 1";

    db.get(assessmentQuery, [userId], (assessmentErr, assessmentResult) => {
        if (assessmentErr) {
            console.error("Error fetching assessment:", assessmentErr.message); // Log server error
            return res.status(500).send("Server Error in fetching assessment"); // Respond with server error
        }

        let gameCategory = null; // Default game category
        
        if (assessmentResult) {
            const score = assessmentResult.score; // Extract score from assessment result
            // Determine the game category based on the assessment score
            if (score >= 16) {
                gameCategory = 'difficult';
            } else if (score >= 11 && score <= 15) {
                gameCategory = 'medium';
            } else {
                gameCategory = 'easy';
            }
        } else {
            console.log("No assessment data found for user:", userId); // Log if no assessment data is found
        }

        // Query to fetch games that match the determined category and calculate progress
        const gameQuery = `
            SELECT g.id, g.title, g.image, g.description, g.category,
                   IFNULL(gp.elapsed_minutes, 0) AS elapsed_minutes,
                   ROUND((IFNULL(gp.elapsed_minutes, 0) / 15.0) * 100, 2) AS progress_percentage
            FROM Games g
            LEFT JOIN game_progress gp ON gp.game_id = g.id AND gp.user_id = ?
            WHERE g.category = ?
        `;

        db.all(gameQuery, [userId, gameCategory], (err, games) => {
            if (err) {
                console.error("Error fetching games:", err.message); // Log error fetching games
                return res.status(500).send("Server Error in fetching games"); // Respond with server error
            }

            // Render the games page with games data and user information
            res.render("games.ejs", {
                title: "Games",
                userName: req.session.userName,
                games: games, // Include games data filtered by assessment score
                progressData: games // Assuming games include progress data
            });
        });
    });
});

// Route to render individual game pages with user-specific game progress
router.get("/games/play/:id", requireAuth, (req, res) => {
    const gameId = req.params.id; // Retrieve the game ID from the URL parameter
    const userId = req.session.userId; // Retrieve the user ID from the session

    // Query to fetch the game progress for a specific game and user
    const query = `
        SELECT elapsed_minutes, start_time FROM game_progress WHERE game_id = ? AND user_id = ?
    `;

    db.get(query, [gameId, userId], (err, row) => {
        if (err) {
            console.error(err.message); // Log any errors
            return res.status(500).send("Server Error"); // Respond with server error
        }

        console.log(row); // Log the fetched row for debugging

        // Render the specific game page with progress data
        res.render(`games/games${gameId}.ejs`, {
            title: `Game ${gameId}`,
            userName: req.session.userName || null,
            gameId: gameId,
            startTime: row ? row.start_time : new Date(), // Use start time from row or current date if not available
            elapsedMinutes: row ? row.elapsed_minutes : 0 // Default to 0 if no progress data found
        });
    });
});

// Route to update game progress
router.post("/games/progress", requireAuth, (req, res) => {
    const { gameId, elapsedMinutes } = req.body; // Retrieve game ID and elapsed minutes from request body
    const userId = req.session.userId; // Retrieve user ID from session

    // Update query for game progress
    const query = `
        UPDATE game_progress
        SET elapsed_minutes = ?
        WHERE game_id = ? AND user_id = ?
    `;

    console.log(`Updating progress for game ${gameId}, user ${userId}: ${elapsedMinutes} minutes`); // Log the update details

    db.run(query, [elapsedMinutes, gameId, userId], (err) => {
        if (err) {
            console.error(err.message); // Log any errors
            return res.status(500).send("Server Error"); // Respond with server error
        }

        res.sendStatus(200); // Send success status
    });
});

// Route to render games filtered by category
router.get("/games/category/:category", (req, res) => {
    const category = req.params.category; // Retrieve the category from URL parameter
    let allGamesQuery = "SELECT * FROM Games WHERE id BETWEEN 1 AND 18"; // Base query to fetch games
    let params = []; // Initialize parameters for query

    if (category !== 'all') {
        allGamesQuery += " AND category = ?"; // Modify query to filter by category
        params.push(category); // Add category to parameters
    }

    db.all(allGamesQuery, params, (err, rows) => {
        if (err) {
            console.error(err.message); // Log any errors
            return res.status(500).send("Server Error"); // Respond with server error
        }

        res.json(rows); // Send games data as JSON response
    });
});

module.exports = router; // Export the router for use in other parts of the application
