// Import the Express framework
const express = require('express');
// Create a new router instance
const router = express.Router();
// Import custom authentication middleware from the 'authenticate' module
const { requireAuth } = require('./authenticate');

/**
 * Function to determine the mental health level based on the total score.
 * 
 * score - The total numerical score from the assessment.
 * category
 */
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

/**
 * Function to convert a textual response to its corresponding numerical value.
 * This mapping is used to quantify the user's responses for scoring.
 * 
 *The textual response from the assessment (e.g., 'Never', 'Sometimes').
 * The numerical value corresponding to the response.
 */
function mapResponseToValue(response) {
    console.log("Mapping response: ", response);  // Debugging line to log the response being mapped
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
            // If the response does not match any case, put default to 0
            return 0;
    }
}

/**
 * Function to generate a descriptive message based on the determined mental health level.
 * 
 * The mental health level category (e.g., 'Low', 'Moderate').
 * A descriptive message corresponding to the level.
 */
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
            // Return an empty string if the level doesn't match any case
            return '';
    }
}

/**
 * Route to handle the submission of an assessment questionnaire.
 * 
 * Endpoint: POST /submit-assessment
 * Middleware:
 *  - requireAuth: Ensures that only authenticated users can submit assessments.
 *  - express.json(): Parses incoming JSON requests and makes the data available in req.body.
 */
router.post('/submit-assessment', requireAuth, express.json(), (req, res) => {
    // Retrieve the user ID from the session. Assumes that user authentication sets req.session.userId
    const userId = req.session.userId; 

    // Destructure the questionnaire responses from the request body
    const { q1, q2, q3, q4, q5 } = req.body;

    console.log("Received data:", req.body);  // Debugging line to log the received data

    // Convert each textual response to its numerical value
    const q1Value = mapResponseToValue(q1);
    const q2Value = mapResponseToValue(q2);
    const q3Value = mapResponseToValue(q3);
    const q4Value = mapResponseToValue(q4);
    const q5Value = mapResponseToValue(q5);

    console.log("Received values: ", q1Value, q2Value, q3Value, q4Value, q5Value);  // Debugging line to log numerical values

    // Calculate the total score by summing the numerical values of all questions
    const score = q1Value + q2Value + q3Value + q4Value + q5Value;
    // Determine the mental health level based on the total score
    const level = determineLevel(score);
    // Get the descriptive message based on the determined level
    const description = getDescription(level);
    // Capture the current time in ISO format to record when the assessment was created
    const createdAt = new Date().toISOString(); // Save the current time in UTC

    console.log("Calculated score: ", score);  // Debugging line to log the total score
    console.log("Determined level: ", level);  // Debugging line to log the mental health level
    console.log("Generated description: ", description);  // Debugging line to log the description

    // Prepare the SQL statement to insert the assessment data into the 'assessments' table
    const stmt = db.prepare("INSERT INTO assessments (userId, q1, q2, q3, q4, q5, score, level, description, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    // Execute the SQL statement with the provided values
    stmt.run(userId, q1Value, q2Value, q3Value, q4Value, q5Value, score, level, description, createdAt, function(err) {
        if (err) {
            // Log the error message to the console
            console.error(err.message);
            // Respond with a 500 Internal Server Error status and an error message
            res.status(500).json({ error: 'Failed to submit assessment' });
            return;
        }
        // Log the ID of the newly inserted assessment for debugging
        console.log("Assessment submitted with ID: ", this.lastID); // Debugging line
        // Respond with a success message and the assessment details
        res.json({ message: 'Assessment submitted successfully', score, level, description, createdAt });
    });
});

/**
 * Route to retrieve all assessments for the authenticated user.
 * 
 * Endpoint: GET /assessments
 * Middleware:
 *  - requireAuth: Ensures that only authenticated users can retrieve assessments.
 */
router.get('/assessments', requireAuth, (req, res) => {
    // Retrieve the user ID from the session
    const userId = req.session.userId; 

    // Execute a SQL query to select all assessments for the user, ordered by creation date descending
    db.all("SELECT * FROM assessments WHERE userId = ? ORDER BY createdAt DESC", [userId], (err, rows) => {
        if (err) {
            // Log the error message to the console
            console.error("Error fetching assessments:", err.message);
            // Respond with a 500 Internal Server Error status and an error message
            res.status(500).json({ error: 'Failed to retrieve assessments' });
            return;
        }
        console.log("Fetched assessments: ", rows); // Debugging line to log the retrieved assessments
        // Respond with the retrieved assessments as a JSON array
        res.json(rows);
    });
});

// Export the router so it can be used in other parts of the application
module.exports = router;
