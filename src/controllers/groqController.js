const config = require('../config/config');

const groqController = {
    analyzeCode: async (req, res) => {
        try {
            const { code } = req.body;
            
            res.json({ message: 'Analyse du code avec Groq' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    
};

module.exports = groqController; 