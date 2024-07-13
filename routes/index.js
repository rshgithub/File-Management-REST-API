// index.js

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

// Route to render file listing page
router.get('/', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(__dirname, '..', 'data'));
        res.render('index', { files });
    } catch (err) {
        console.error('Error reading files:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
