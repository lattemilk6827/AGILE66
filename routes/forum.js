const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('./authenticate');
const bcrypt = require('bcrypt');

// Number of entries per page
const entriesPerPage = 4;

// Retrieve Forum data with pagination, optional category filtering, and extended search functionality
function fetchForumData(page, category, searchQuery, callback) {
    const offset = (page - 1) * entriesPerPage;
    let query = `SELECT Forum.forum_id, Forum.forum_title, Forum.forum_subtitle, 
                 Forum.forum_publishedtimestamp, Forum.forum_likes, Users.user_name
                 FROM Forum JOIN Users ON Forum.user_id = Users.id`;
    let params = [];

    let conditions = [];
    if (category) {
        conditions.push("Forum.forum_category = ?");
        params.push(category);
    }
    if (searchQuery) {
        conditions.push("(Forum.forum_title LIKE ? OR Forum.forum_subtitle LIKE ? OR Forum.forum_body LIKE ? OR Users.user_name LIKE ?)");
        params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    }

    if (conditions.length) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY Forum.forum_publishedtimestamp DESC LIMIT ? OFFSET ?";
    params.push(entriesPerPage, offset);

    global.db.serialize(() => {
        global.db.all(query, params, (err, forums) => {
            if (err) {
                callback(err);
                return;
            }
            // Query to count the total entries
            global.db.get("SELECT COUNT(*) AS count FROM Forum JOIN Users ON Forum.user_id = Users.id" + 
                          (conditions.length ? " WHERE " + conditions.join(" AND ") : ""), 
                          params.slice(0, -2), (err, result) => {
                if (err) {
                    callback(err);
                    return;
                }
                const totalEntries = result.count;
                callback(null, { forums, totalEntries });
            });
        });
    });
}


function fetchLatestDiscussions(callback) {
    const query = `
        SELECT Forum.forum_id, Forum.forum_title AS title, Forum_Comments.comment_text AS content, Users.user_name AS username, Forum_Comments.comment_timestamp AS posted_on
        FROM Forum_Comments
        JOIN Forum ON Forum_Comments.forum_id = Forum.forum_id
        JOIN Users ON Forum.user_id = Users.id
        ORDER BY Forum_Comments.comment_timestamp DESC
        LIMIT 3
    `;

    global.db.all(query, (err, posts) => {
        if (err) return callback(err);
        callback(null, posts);
    });
}
// Route to display all forum entries with pagination and filtering
router.get('/forum', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || '';
    const searchQuery = req.query.search || '';

    fetchForumData(page, category, searchQuery, (err, data) => {
        if (err) {
            res.status(500).send('Error fetching forum data');
            return;
        }
    
        console.log(data.forums); // Log the forums data to verify it's correct
    
        // Fetch latest discussions here
        fetchLatestDiscussions((err, posts) => {
            if (err) {
                res.status(500).send('Error fetching latest discussions');
                return;
            }
            const totalPages = Math.ceil(data.totalEntries / entriesPerPage);
            res.render('forum', {
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
    const page = parseInt(req.query.page) || 1;
    const userId = req.session.userId;
    const offset = (page - 1) * entriesPerPage;

    const query = `
        SELECT forum_id, forum_title, forum_subtitle, forum_publishedtimestamp, forum_likes 
        FROM Forum 
        WHERE user_id = ? 
        LIMIT ? OFFSET ?
    `;
    const countQuery = `
        SELECT COUNT(*) AS count 
        FROM Forum 
        WHERE user_id = ?
    `;

    global.db.serialize(() => {
        global.db.all(query, [userId, entriesPerPage, offset], (err, forums) => {
            if (err) {
                res.status(500).send('Error fetching forum data');
                return;
            }
            global.db.get(countQuery, [userId], (err, result) => {
                if (err) {
                    res.status(500).send('Error fetching forum data count');
                    return;
                }
                const totalEntries = result.count;
                const totalPages = Math.ceil(totalEntries / entriesPerPage);

                // Fetch latest discussions here
                fetchLatestDiscussions((err, posts) => {
                    if (err) {
                        res.status(500).send('Error fetching latest discussions');
                        return;
                    }

                    res.render('forum', {
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



// Retrieve data for a single forum post
function fetchForumPost(forumId, callback) {
    const query = `
        SELECT Forum.*, Users.user_name
        FROM Forum
        JOIN Users ON Forum.user_id = Users.id
        WHERE forum_id = ?
    `;
    const commentsQuery = `
        SELECT * FROM Forum_Comments WHERE forum_id = ? ORDER BY comment_timestamp DESC
    `;
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
            callback(null, { forum, comments });
        });
    });
}



router.get('/forum/:id', requireAuth, (req, res) => {
    const forumId = req.params.id;
    fetchForumPost(forumId, (err, data) => {
        if (err) {
            res.status(500).send('Error fetching forum post');
            return;
        }
        if (!data.forum) {
            res.status(404).send('Forum post not found');
            return;
        }
        res.render('forum-view', {
            title: data.forum.forum_title,
            forum: data.forum,
            comments: data.comments,
            userName: req.session.userName || null,
        });
    });
});

// Ensure user is authenticated before accessing the new post page
router.get('/newPost', requireAuth, (req, res) => {
    res.render('forum-create.ejs', {
        title: 'Create a New Forum Post',
        errors: [],
        userName: req.session.userName || null,
        formData: {}
    });
});

// Add the necessary route to handle the creation of a new post
router.post('/newPost', requireAuth, [
    check('forum_title').notEmpty().withMessage('Title is required'),
    check('forum_subtitle').notEmpty().withMessage('Subtitle is required'),
    check('forum_body').notEmpty().withMessage('Body is required'),
    check('forum_category').notEmpty().withMessage('Category is required')
], (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.render('forum-create', {
            title: 'Create a New Forum Post',
            errors: errorMessages,
            userName: req.session.userName || null,
            formData: req.body
        });
    }

    const { forum_title, forum_subtitle, forum_body, forum_category } = req.body;
    const user_id = req.session.userId;

    const query = "INSERT INTO Forum (user_id, forum_title, forum_subtitle, forum_body, forum_category) VALUES (?, ?, ?, ?, ?)";
    const params = [user_id, forum_title, forum_subtitle, forum_body, forum_category];

    global.db.run(query, params, function(err) {
        if (err) {
            return res.status(500).send('Error saving the forum post');
        }
        res.redirect('/forum');
    });
});

// Likes
router.post('/forum/:forum_id/like', requireAuth, (req, res) => {
    const userId = req.session.userId; // Assuming you have session middleware
    const forumId = req.params.forum_id; // Use req.params for forum ID from URL

    global.db.get('SELECT * FROM Likes WHERE user_id = ? AND forum_id = ?', [userId, forumId], (err, existingLike) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred' });
        }

        if (existingLike) {
            // User has already liked the post, so unlike it
            global.db.run('DELETE FROM Likes WHERE user_id = ? AND forum_id = ?', [userId, forumId], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'An error occurred' });
                }

                global.db.run('UPDATE Forum SET forum_likes = forum_likes - 1 WHERE forum_id = ?', [forumId], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'An error occurred' });
                    }

                    return res.json({ success: true, action: 'unliked' });
                });
            });
        } else {
            // User has not liked the post yet, so like it
            global.db.run('INSERT INTO Likes (user_id, forum_id) VALUES (?, ?)', [userId, forumId], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'An error occurred' });
                }

                global.db.run('UPDATE Forum SET forum_likes = forum_likes + 1 WHERE forum_id = ?', [forumId], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'An error occurred' });
                    }

                    return res.json({ success: true, action: 'liked' });
                });
            });
        }
    });
});

//posting comments
router.post('/forum/:id/comment', requireAuth, (req, res) => {
    const forumId = req.params.id;
    const { commenter_name, comment_text } = req.body;

    const query = "INSERT INTO Forum_Comments (forum_id, commenter_name, comment_text) VALUES (?, ?, ?)";
    global.db.run(query, [forumId, commenter_name, comment_text], function(err) {
        if (err) {
            return res.status(500).send('Error saving the comment');
        }
        res.redirect(`/forum/${forumId}`);
    });
});


router.get('/latest-discussions', requireAuth, (req, res) => {
    const query = `
        SELECT ForumPosts.title, ForumPosts.content, Users.username, ForumPosts.posted_on
        FROM ForumPosts
        JOIN Users ON ForumPosts.user_id = Users.id
        ORDER BY posted_on DESC
        LIMIT 3
    `;

    global.db.all(query, (err, posts) => {
        if (err) {
            console.error('Error fetching latest discussions:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(posts);
    });
});

module.exports = router;