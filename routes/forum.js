const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('./authenticate');
const bcrypt = require('bcrypt');

// Number of entries per page
const entriesPerPage = 4;

// Retrieve Forum data with pagination and optional category filtering
function fetchForumData(page, category, callback) {
    const offset = (page - 1) * entriesPerPage;
    let query = "SELECT forum_id, forum_title, forum_subtitle, forum_publishedtimestamp, forum_likes FROM Forum";
    let params = [];

    if (category) {
        query += " WHERE forum_category = ?";
        params.push(category);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(entriesPerPage, offset);

    global.db.serialize(() => {
        global.db.all(query, params, (err, forums) => {
            if (err) {
                callback(err);
                return;
            }
            global.db.get("SELECT COUNT(*) AS count FROM Forum" + (category ? " WHERE forum_category = ?" : ""), category ? [category] : [], (err, result) => {
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

// Route to display all forum entries with pagination and filtering
router.get('/forum', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || '';
    fetchForumData(page, category, (err, data) => {
        if (err) {
            res.status(500).send('Error fetching forum data');
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
    global.db.get(query, [forumId], (err, forum) => {
        if (err) {
            console.error('Error fetching forum post:', err);
            callback(err);
            return;
        }
        console.log('Fetched forum post:', forum);
        callback(null, forum);
    });
}

router.get('/forum/:id', requireAuth, (req, res) => {
    const forumId = req.params.id;
    fetchForumPost(forumId, (err, forum) => {
        if (err) {
            res.status(500).send('Error fetching forum post');
            return;
        }
        if (!forum) {
            res.status(404).send('Forum post not found');
            return;
        }
        res.render('forum-view', {
            title: forum.forum_title,
            forum: forum,
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


module.exports = router;
