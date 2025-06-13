import express from 'express';
// import { testGroq, analyzeFile } from "../controllers/groqController.js";
import groqController from '../controllers/groqController.js';


const router = express.Router();

// Route pour analyser du code (test)
// router.get('/analyze', async (req, res) => {
//     try {
//         const result = await testGroq();
//         res.json({ message: result });
//     } catch (error) {
//         console.error('Erreur:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route pour analyser un fichier spécifique
// router.post('/analyze-file', async (req, res) => {
//     try {
//         const { filename, changes, content } = req.body;
        
//         if (!filename || !content) {
//             return res.status(400).json({ error: 'Filename et content sont requis' });
//         }
        
//         const fileData = { filename, changes, content };
//         const result = await analyzeFile(fileData);
        
//         res.json({ 
//             filename: result.filename,
//             analysis: result.analysis 
//         });
//     } catch (error) {
//         console.error('Erreur lors de l\'analyse du fichier:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

router.post('/review', groqController.analyseCommits)

// router.post('/review', (req, res, next) => {
//   console.log('>>> Route POST /api/groq/review appelée');
//   next(); // passe la main au controller
// }, groqController.analyseCommits);

export default router; 