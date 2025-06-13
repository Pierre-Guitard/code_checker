import express from 'express';
import githubController from '../controllers/githubController.js';

const router = express.Router();

router.get('/repositories', githubController.getRepositories);
router.get('/specific-commit', githubController.getAllCommitsFromUser);
// router.get('/specific-commit', async (req, res) => {
//     try {
//         const data = await githubController.getAllCommitsFromUser();
//         res.json(data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

export default router; 