const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

router.get('/repositories', githubController.getRepositories);

module.exports = router; 