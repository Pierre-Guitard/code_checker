import express from 'express';
import groqController from '../controllers/groqController.js';

const router = express.Router();

router.post('/review', groqController.analyseCommits)

export default router; 