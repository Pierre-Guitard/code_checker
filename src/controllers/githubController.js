const config = require('../config/config');
const axios = require('axios');

const githubController = {
    
    getRepositories: async (req, res) => {
        try {
            const { url } = req.body;
      
            // url verif
            if (!url || !url.includes('github.com')) {
              return res.status(400).json({ error: 'URL GitHub invalide.' });
            }
            console.log(url);  
            // extraire owner et repo via regex
            const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) {
              return res.status(400).json({ error: 'Impossible d’extraire les infos du repo.' });
            }
            console.log(match);
      
            const owner = match[1];
            const repo = match[2];
            console.log(owner, repo);
            // appel api github
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            
            });
            console.log(response.data);
            // récupérer les info importante
            const data = response.data;
            res.json({
              name: data.name,
              full_name: data.full_name,
              description: data.description,
              stars: data.stargazers_count,
              forks: data.forks_count,
              language: data.language,
              visibility: data.visibility
            });
      
          } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Erreur lors de la récupération du dépôt.' });
          }
        },

        //ajouter les autres fonctionnalite ici
};

module.exports = githubController; 