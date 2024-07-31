const express = require("express");
const router = express.Router();
const { requireAuth } = require("./authenticate");

// Render Games Page
router.get("/games", (req, res) => {
    const userId = req.session.userId;
    const query = `
        SELECT gp.game_id, gp.elapsed_minutes, g.title, g.image, g.description, g.category,
               ROUND((gp.elapsed_minutes / 15.0) * 100, 2) AS progress_percentage
        FROM game_progress gp
        JOIN Games g ON gp.game_id = g.id
        WHERE gp.user_id = ?
    `;
    
    // Fetch game progress and game details for the logged-in user
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Server Error");
        }

        // Log fetched rows for debugging
        console.log(rows);

        // Render games.ejs with game progress data
        res.render("games.ejs", {
            title: "Games",
            userName: req.session.userName || null,
            progressData: rows // Pass progress data to the template
        });
    });
});

// Render individual game pages
router.get("/games/play/:id", requireAuth, (req, res) => {
    const gameId = req.params.id;
    const userId = req.session.userId;

    const query = `
        SELECT elapsed_minutes, start_time FROM game_progress WHERE game_id = ? AND user_id = ?
    `;
    
    // Fetch game progress for the specific game and user
    db.get(query, [gameId, userId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Server Error");
        }

        // Log fetched row for debugging
        console.log(row);

        // Render the specific game page with progress data
        res.render(`games/games${gameId}.ejs`, {
            title: `Game ${gameId}`,
            userName: req.session.userName || null,
            gameId: gameId,
            startTime: row ? row.start_time : new Date(), // If no row, use current date
            elapsedMinutes: row ? row.elapsed_minutes : 0 // Default to 0 if no row found
        });
    });
});

// Update game progress
router.post("/games/progress", requireAuth, (req, res) => {
    const { gameId, elapsedMinutes } = req.body;
    const userId = req.session.userId;

    const query = `
        UPDATE game_progress
        SET elapsed_minutes = ?
        WHERE game_id = ? AND user_id = ?
    `;
    
    // Log the progress update details
    console.log(`Updating progress for game ${gameId}, user ${userId}: ${elapsedMinutes} minutes`);

    // Update game progress for the specific game and user
    db.run(query, [elapsedMinutes, gameId, userId], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Server Error");
        }

        res.sendStatus(200);
    });
});

// Render games by category
router.get("/games/category/:category", (req, res) => {
    const category = req.params.category;
    let allGamesQuery = "SELECT * FROM Games WHERE id BETWEEN 1 AND 18";
    let params = [];

    if (category !== 'all') {
        allGamesQuery += " AND category = ?";
        params.push(category);
    }

    // Fetch games by category
    db.all(allGamesQuery, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Server Error");
        }


        res.json(rows);
    });
});

module.exports = router;
