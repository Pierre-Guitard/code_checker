import axios from 'axios';

const githubController = {
    
    getRepositories: async (req, res) => {
        try {
            const { url } = req.body;
      
            if (!url || !url.includes('github.com')) {
                return res.status(400).json({ error: 'URL GitHub invalide.' });
            }
            console.log(url);  

            const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) {
                return res.status(400).json({ error: 'Impossible d\'extraire les infos du repo.' });
            }
            console.log(match);
      
            const owner = match[1];
            const repo = match[2];
            console.log(owner, repo);

            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
            console.log(response.data);

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

    getSpecificCommit: async () => {
        const urlArray = []
        try {
            const response = await axios.get('https://api.github.com/repos/Pierre-Guitard/code_checker/commits?author=Pierre-Guitard');
            const commitData = response.data;
            commitData.forEach(commit => {
               urlArray.push(commit.url)
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du commit:', error.message);
            throw error;
        }
    },

    // Reste à faire : 
        // Une fonction qui parcourt le tableau urlArray et récupère les informations de chaque commit
        // Pour chaque commit, on le fait analyser par Groq
        // On récupère la réponse de Groq et on l'enregistre dans un tableau
        // On affiche le tableau de réponses de Groq
            // Le tableau doit contenir : 
                // - Author.name
};              // - 

export default githubController; 