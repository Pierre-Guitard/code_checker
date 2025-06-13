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

    getAllCommitsFromUser: async (req, res) => {

        const urlArray = []
        try {
            const header = {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            };
            const response = await axios.get('https://api.github.com/repos/Pierre-Guitard/code_checker/commits?author=H4SS4NN', header);
            const commitData = response.data;
            commitData.forEach(commit => {
               urlArray.push(commit.url)
            });
            // res.json(urlArray);
            // console.log("COMMITDATA", commitData);
            
            const commitsContent = [];
            await Promise.all(
                urlArray.map(async (url) => {
                    const commitDetails = await axios.get(url, header);
                    const files = commitDetails.data.files;

                    files.forEach(file => {
                    const ignoredFiles = ['node_modules', 'package-lock.json', 'package.json', 'README.md', 'config.js'];
                    const shouldIgnore = ignoredFiles.some(ignored => file.filename.includes(ignored));

                    if (file.patch && !shouldIgnore) {
                        commitsContent.push({
                        filename: file.filename,
                        content: file.patch
                        });
                    }
                    });
                })
            );

            console.log("commitsCOntent", commitsContent);
            const codeReview = await axios.post('http://localhost:3000/api/groq/review', commitsContent)
            res.json(codeReview.data)
        
        } catch (error) {
            console.error('Erreur lors de la récupération du commit:', error.message);
            throw error;
        }
    }
};

export default githubController; 