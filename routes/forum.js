// Import required modules and libraries
const express = require("express");
const router = express.Router(); // Create a new instance of the express router
const { check, validationResult } = require('express-validator'); // Import validators for data validation
const { requireAuth } = require('./authenticate'); // Import authentication middleware
const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords

// Configuration variable for pagination
const entriesPerPage = 4; // Number of entries shown per page

// Function to fetch forum data with pagination and optional filtering by category and search query
function fetchForumData(page, category, searchQuery, callback) {
    const offset = (page - 1) * entriesPerPage; // Calculate the offset for SQL query
    let query = `SELECT Forum.forum_id, Forum.forum_title, Forum.forum_subtitle, 
                 Forum.forum_publishedtimestamp, Forum.forum_likes, Users.user_name
                 FROM Forum JOIN Users ON Forum.user_id = Users.id`; // Base SQL query
    let params = []; // Parameters for SQL query

    let conditions = []; // Conditions for WHERE clause
    if (category) {
        conditions.push("Forum.forum_category = ?"); // Add category condition if specified
        params.push(category);
    }
    if (searchQuery) {
        conditions.push("(Forum.forum_title LIKE ? OR Forum.forum_subtitle LIKE ? OR Forum.forum_body LIKE ? OR Users.user_name LIKE ?)");
        params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`); // Add search condition
    }

    if (conditions.length) {
        query += " WHERE " + conditions.join(" AND "); // Append conditions to the base query
    }

    query += " ORDER BY Forum.forum_publishedtimestamp DESC LIMIT ? OFFSET ?"; // Add ordering and pagination
    params.push(entriesPerPage, offset);

    global.db.serialize(() => { // Serialize queries to ensure order execution
        global.db.all(query, params, (err, forums) => { // Execute the main query
            if (err) {
                callback(err);
                return;
            }
            // Subquery to count the total number of entries
            global.db.get("SELECT COUNT(*) AS count FROM Forum JOIN Users ON Forum.user_id = Users.id" + 
                          (conditions.length ? " WHERE " + conditions.join(" AND ") : ""), 
                          params.slice(0, -2), (err, result) => {
                if (err) {
                    callback(err);
                    return;
                }
                const totalEntries = result.count; // Retrieve total entries for pagination
                callback(null, { forums, totalEntries }); // Callback with data and total entries
            });
        });
    });
}

//Fetches the latest discussions from the database.
function fetchLatestDiscussions(callback) {
    const query = `
        SELECT Forum.forum_id, Forum.forum_title AS title, Forum_Comments.comment_text AS content, Users.user_name AS username, Forum_Comments.comment_timestamp AS posted_on
        FROM Forum_Comments
        JOIN Forum ON Forum_Comments.forum_id = Forum.forum_id
        JOIN Users ON Forum.user_id = Users.id
        ORDER BY Forum_Comments.comment_timestamp DESC
        LIMIT 3
    `; // SQL query to fetch the latest three discussions

    global.db.all(query, (err, posts) => { // Execute the query
        if (err) return callback(err); // Handle error
        callback(null, posts); // Handle success response
    });
}

// Define routes
// Route to display all forum entries with pagination and filtering
router.get('/forum', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the current page number from the query string or default to 1
    const category = req.query.category || ''; // Get the category from the query string or default to empty
    const searchQuery = req.query.search || ''; // Get the search query from the query string or default to empty

    fetchForumData(page, category, searchQuery, (err, data) => { // Fetch forum data with given filters
        if (err) {
            res.status(500).send('Error fetching forum data'); // Handle server error
            return;
        }

        console.log(data.forums); // Log the forums data to verify it's correct

        fetchLatestDiscussions((err, posts) => { // Fetch latest discussions to be displayed on the page
            if (err) {
                res.status(500).send('Error fetching latest discussions'); // Handle error fetching discussions
                return;
            }
            const totalPages = Math.ceil(data.totalEntries / entriesPerPage); // Calculate total pages for pagination
            res.render('forum', { // Render the forum view
                title: 'Forum',
                forums: data.forums,
                userName: req.session.userName || null,
                currentPage: page,
                totalPages: totalPages,
                selectedCategory: category,
                searchQuery: searchQuery,
                posts: posts
            });
        });
    });
});

// Route to display all forum entries created by the logged-in user with pagination
router.get('/myPosts', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the current page from the query or default to 1
    const userId = req.session.userId; // Get the logged-in user's ID from session
    const offset = (page - 1) * entriesPerPage; // Calculate offset for SQL query

    const query = `
        SELECT forum_id, forum_title, forum_subtitle, forum_publishedtimestamp, forum_likes 
        FROM Forum 
        WHERE user_id = ? 
        LIMIT ? OFFSET ?
    `; // SQL query to fetch forum posts by the user
    const countQuery = `
        SELECT COUNT(*) AS count 
        FROM Forum 
        WHERE user_id = ?
    `; // SQL query to count total posts by the user

    global.db.serialize(() => {
        global.db.all(query, [userId, entriesPerPage, offset], (err, forums) => {
            if (err) {
                res.status(500).send('Error fetching forum data'); // Handle server error
                return;
            }
            global.db.get(countQuery, [userId], (err, result) => {
                if (err) {
                    res.status(500).send('Error fetching forum data count'); // Handle server error
                    return;
                }
                const totalEntries = result.count; // Get the total number of entries
                const totalPages = Math.ceil(totalEntries / entriesPerPage); // Calculate total pages for pagination

                fetchLatestDiscussions((err, posts) => {
                    if (err) {
                        res.status(500).send('Error fetching latest discussions'); // Handle error
                        return;
                    }

                    res.render('forum', { // Render the user's forum posts view
                        title: 'My Posts',
                        forums: forums,
                        userName: req.session.userName || null,
                        currentPage: page,
                        totalPages: totalPages,
                        selectedCategory: '',
                        searchQuery: '',
                        posts: posts
                    });
                });
            });
        });
    });
});

// Retrieve data for a single forum post including its comments
function fetchForumPost(forumId, callback) {
    const query = `
        SELECT Forum.*, Users.user_name
        FROM Forum
        JOIN Users ON Forum.user_id = Users.id
        WHERE forum_id = ?
    `; // SQL query to fetch detailed forum post data
    const commentsQuery = `
        SELECT * FROM Forum_Comments WHERE forum_id = ? ORDER BY comment_timestamp DESC
    `; // SQL query to fetch comments for the forum post

    global.db.get(query, [forumId], (err, forum) => {
        if (err) {
            console.error('Error fetching forum post:', err);
            callback(err);
            return;
        }

        global.db.all(commentsQuery, [forumId], (err, comments) => {
            if (err) {
                console.error('Error fetching comments:', err);
                callback(err);
                return;
            }
            callback(null, { forum, comments }); // Callback with forum post data and its comments
        });
    });
}

router.get('/forum/:id', requireAuth, (req, res) => {
    const forumId = req.params.id; // Get forum ID from URL parameters
    fetchForumPost(forumId, (err, data) => {
        if (err) {
            res.status(500).send('Error fetching forum post'); // Handle server error
            return;
        }
        if (!data.forum) {
            res.status(404).send('Forum post not found'); // Handle case where no forum post is found
            return;
        }
        res.render('forum-view', { // Render detailed view of a forum post
            title: data.forum.forum_title,
            forum: data.forum,
            comments: data.comments,
            userName: req.session.userName || null,
        });
    });
});

// Route to render the form for creating a new forum post
router.get('/newPost', requireAuth, (req, res) => {
    res.render('forum-create.ejs', { // Render the forum post creation page
        title: 'Create a New Forum Post',
        errors: [], // Initially, no errors to display
        userName: req.session.userName || null, // User name from session for personalization
        formData: {} // Empty form data to be filled by the user
    });
});

// Route to handle the submission of a new forum post
router.post('/newPost', requireAuth, [
    check('forum_title').notEmpty().withMessage('Title is required'), // Validate title is not empty
    check('forum_subtitle').notEmpty().withMessage('Subtitle is required'), // Validate subtitle is not empty
    check('forum_body').notEmpty().withMessage('Body is required'), // Validate body is not empty
    check('forum_category').notEmpty().withMessage('Category is required') // Validate category is not empty
], (req, res) => {
    const errors = validationResult(req); // Check for validation errors
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg); // Map errors to messages
        return res.render('forum-create', {
            title: 'Create a New Forum Post',
            errors: errorMessages, // Display error messages
            userName: req.session.userName || null,
            formData: req.body // Preserve user input in form data
        });
    }

    const { forum_title, forum_subtitle, forum_body, forum_category } = req.body; // Destructure form data
    const user_id = req.session.userId; // Get user ID from session

    const query = "INSERT INTO Forum (user_id, forum_title, forum_subtitle, forum_body, forum_category) VALUES (?, ?, ?, ?, ?)";
    const params = [user_id, forum_title, forum_subtitle, forum_body, forum_category]; // SQL parameters

    global.db.run(query, params, function(err) { // Execute the insert query
        if (err) {
            return res.status(500).send('Error saving the forum post'); // Handle SQL error
        }
        res.redirect('/forum'); // Redirect to the forum list page after successful creation
    });
});

// Route to handle liking a forum post
router.post('/forum/:forum_id/like', requireAuth, (req, res) => {
    const userId = req.session.userId; // User ID from session
    const forumId = req.params.forum_id; // Forum ID from URL parameter

    global.db.get('SELECT * FROM Likes WHERE user_id = ? AND forum_id = ?', [userId, forumId], (err, existingLike) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred' }); // Handle database error
        }

        if (existingLike) {
            // If like exists, user is unliking the post
            global.db.run('DELETE FROM Likes WHERE user_id = ? AND forum_id = ?', [userId, forumId], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'An error occurred' }); // Handle database error
                }

                global.db.run('UPDATE Forum SET forum_likes = forum_likes - 1 WHERE forum_id = ?', [forumId], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'An error occurred' }); // Handle database error
                    }

                    return res.json({ success: true, action: 'unliked' }); // Send success response for unliking
                });
            });
        } else {
            // If like does not exist, user is liking the post
            global.db.run('INSERT INTO Likes (user_id, forum_id) VALUES (?, ?)', [userId, forumId], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'An error occurred' }); // Handle database error
                }

                global.db.run('UPDATE Forum SET forum_likes = forum_likes + 1 WHERE forum_id = ?', [forumId], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'An error occurred' }); // Handle database error
                    }

                    return res.json({ success: true, action: 'liked' }); // Send success response for liking
                });
            });
        }
    });
});

// Route for posting comments on a forum post
router.post('/forum/:id/comment', requireAuth, (req, res) => {
    const forumId = req.params.id; // Forum ID from URL parameters
    const { commenter_name, comment_text } = req.body; // Destructure commenter name and text from request body

    const query = "INSERT INTO Forum_Comments (forum_id, commenter_name, comment_text) VALUES (?, ?, ?)";
    global.db.run(query, [forumId, commenter_name, comment_text], function(err) {
        if (err) {
            return res.status(500).send('Error saving the comment'); // Handle SQL error
        }
        res.redirect(`/forum/${forumId}`); // Redirect back to the forum post after commenting
    });
});

// Route to fetch latest discussions and display as JSON
router.get('/latest-discussions', requireAuth, (req, res) => {
    const query = `
        SELECT ForumPosts.title, ForumPosts.content, Users.username, ForumPosts.posted_on
        FROM ForumPosts
        JOIN Users ON ForumPosts.user_id = Users.id
        ORDER BY posted_on DESC
        LIMIT 3
    `; // SQL query to fetch the latest three discussion posts

    global.db.all(query, (err, posts) => {
        if (err) {
            console.error('Error fetching latest discussions:', err);
            return res.status(500).send('Internal Server Error'); // Handle server error
        }
        res.json(posts); // Send fetched posts as JSON
    });
});

module.exports = router; // Export the router to be used in other parts of the application
