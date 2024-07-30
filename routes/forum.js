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
router.get('/forum', (req, res) => {
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

module.exports = router;
