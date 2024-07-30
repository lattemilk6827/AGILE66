const express = require("express");
// Create a new instance of the express router
const router = express.Router();

// Render Games Page
router.get("/games", (req, res) => {
    res.render("games.ejs", {
        title: "Games",
        userName: req.session.userName || null // Pass the username to the template
    });
});

// Render individual game pages
router.get("/games/play/:id", (req, res) => {
    const gameId = req.params.id;
    if (gameId >= 1 && gameId <= 18) {
        res.render(`games/games${gameId}.ejs`, {
            title: `Game ${gameId}`,
            userName: req.session.userName || null
        });
    } else {
        res.status(404).send("Game not found");
    }
});
// Render all the games under each section and the selected games after category sorting
router.get("/games/category/:category", (req, res) => {
    const category = req.params.category;
    let allgamesquery = "SELECT * FROM Games WHERE id BETWEEN 1 AND 18";
    let params = [];

    if (category !== 'all') {
        allgamesquery += " AND category = ?";
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
