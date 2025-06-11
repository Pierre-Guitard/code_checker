const config = require('../config/config');

const groqController = {
    analyzeCode: async (req, res) => {
        try {
            const { code } = req.body;
            // TODO: Implémenter l'appel à l'API Groq
            res.json({ message: 'Analyse du code avec Groq' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    
};

module.exports = groqController; 