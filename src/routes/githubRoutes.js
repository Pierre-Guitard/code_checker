const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

router.post('/repositories', githubController.getRepositories);

module.exports = router;
