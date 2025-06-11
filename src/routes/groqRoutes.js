const express = require('express');
const router = express.Router();
const groqController = require('../controllers/groqController');

// Route pour analyser du code
router.post('/analyze', groqController.analyzeCode);


module.exports = router; 