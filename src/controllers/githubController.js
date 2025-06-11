const config = require('../config/config');

const githubController = {
    
    getRepositories: async (req, res) => {
        try {
            // TODO: Implémenter la logique pour récupérer les repositories
            res.json({ message: 'Liste des repositories' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    //TODO: Implémenter la logique pour récupérer les repositories et etc 
};

module.exports = githubController; 