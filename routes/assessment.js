const express = require('express');
const router = express.Router();
// Import custom authentication middleware
const { requireAuth } = require('./authenticate');


// Function to determine mental health level based on score
function determineLevel(score) {
    if (score <= 5) {
        return 'Low';
    } else if (score <= 10) {
        return 'Moderate';
    } else if (score <= 15) {
        return 'High';
    } else {
        return 'Very High';
    }
}

// Function to convert textual response to numerical value
function mapResponseToValue(response) {
    console.log("Mapping response: ", response);  // Debugging line
    switch(response) {
        case 'Not at all':
            return 0;
        case 'Rarely':
            return 1;
        case 'Sometimes':
            return 2;
        case 'Often':
            return 3;
        case 'Very Often':
            return 4;
        case 'Always':
            return 5;
        default:
            return 0;
    }
}

// Function to generate description based on level
function getDescription(level) {
    switch(level) {
        case 'Low':
            return 'Your child is showing healthy emotional and behavioral habits. They are able to manage stress and anxiety, and are likely to have a positive outlook on life.';
        case 'Moderate':
            return 'Your child may be experiencing some emotional or behavioral challenges, such as anxiety, sadness, or difficulty sleeping. They may need some extra support to manage these feelings.';
        case 'High':
            return 'Your child is showing signs of significant emotional or behavioral distress, such as frequent anxiety, depression, or behavioral outbursts. They may need immediate support to manage these feelings and develop healthy coping strategies.';
        case 'Very High':
            return 'Your child is showing signs of severe emotional or behavioral distress, such as suicidal thoughts, self-harm, or extreme behavioral outbursts. They need immediate support and intervention to ensure their safety and well-being.';
        default:
            return '';
    }
}


// Route to handle questionnaire submission
router.post('/submit-assessment',requireAuth, express.json(), (req, res) => {
    const userId = req.user ? req.user.id : 1; // Assuming you have user authentication, default to 1 for testing
    const { q1, q2, q3, q4, q5 } = req.body;

    console.log("Received data:", req.body);  // Debugging line

    // Convert responses to numerical values
    const q1Value = mapResponseToValue(q1);
    const q2Value = mapResponseToValue(q2);
    const q3Value = mapResponseToValue(q3);
    const q4Value = mapResponseToValue(q4);
    const q5Value = mapResponseToValue(q5);

    console.log("Received values: ", q1Value, q2Value, q3Value, q4Value, q5Value);  // Debugging line

    // Calculate score
    const score = q1Value + q2Value + q3Value + q4Value + q5Value;
    const level = determineLevel(score);
    const description = getDescription(level);
    const createdAt = new Date().toISOString(); // Save the current time in UTC

    console.log("Calculated score: ", score);  // Debugging line
    console.log("Determined level: ", level);  // Debugging line
    console.log("Generated description: ", description);  // Debugging line

    // Insert assessment into the database
    const stmt = db.prepare("INSERT INTO assessments (userId, q1, q2, q3, q4, q5, score, level, description, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(userId, q1Value, q2Value, q3Value, q4Value, q5Value, score, level, description, createdAt, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to submit assessment' });
            return;
        }
        console.log("Assessment submitted with ID: ", this.lastID); // Debugging line
        res.json({ message: 'Assessment submitted successfully', score, level, description, createdAt });
    });
});

// Route to retrieve the latest and past results
router.get('/assessments',requireAuth, (req, res) => {
    const userId = req.user ? req.user.id : 1; // Assuming you have user authentication, default to 1 for testing

    db.all("SELECT * FROM assessments WHERE userId = ? ORDER BY createdAt DESC", [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching assessments:", err.message);
            res.status(500).json({ error: 'Failed to retrieve assessments' });
            return;
        }
        console.log("Fetched assessments: ", rows); // Debugging line
        res.json(rows);
    });
});


module.exports = router;

