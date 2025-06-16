import express from 'express';
import githubController from '../controllers/githubController.js';

const router = express.Router();

router.post('/repositories', githubController.getRepositories);
router.get('/specific-commit', githubController.getAllCommitsFromUser);
router.post('/get-repository-code', githubController.getRepositoryCode);
export default router; 


