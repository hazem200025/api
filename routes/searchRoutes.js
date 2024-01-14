// searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../Controllers/searchController');

router.get('/users', searchController.searchUsers);
router.get('/posts', searchController.searchPosts);

module.exports = router;
