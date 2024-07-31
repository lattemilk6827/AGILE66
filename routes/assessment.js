const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // Update with the path to your SQLite database


// Route to handle form submission
router.post('/submit-questionnaire', (req, res) => {
    const userId = req.user ? req.user.id : null; // Get user ID from session or other authentication method
    const { question1, question2, question3, question4, question5 } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: 'User not authenticated' });
    }

    const responseDate = new Date().toISOString(); // Current date and time

    // Insert response data into the database
    const query = `
        INSERT INTO Responses (user_id, question1, question2, question3, question4, question5, responseDate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [userId, question1, question2, question3, question4, question5, responseDate], function(err) {
        if (err) {
            console.error('Error inserting response:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Response submitted successfully' });
    });
});

// Promisify the db.all method for use with async/await
const getPastResponses = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM Responses WHERE user_id = ?`;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Route to display past responses
router.get('/past-responses', async (req, res) => {
    const userId = req.user ? req.user.id : null; // Get user ID from session or other authentication method

    if (!userId) {
        return res.status(400).json({ message: 'User not authenticated' });
    }

    try {
        const responses = await getPastResponses(userId);
        res.render('past-responses', { responses });
    } catch (err) {
        console.error('Error retrieving responses:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
