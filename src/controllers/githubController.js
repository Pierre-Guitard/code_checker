const config = require('../config/config');
const axios = require('axios');

const githubController = {
  getRepositories: async (req, res) => {
    try {
      const url = req.body.url || req.query.url;

      if (!url || !url.includes('github.com')) {
        return res.status(400).json({ error: 'URL GitHub invalide.' });
      }

      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return res.status(400).json({
          error: "Impossible d'extraire les infos du repo."
        });
      }

      const owner = match[1];
      const repo = match[2];

      const headers = {
        Authorization: `Bearer ${config.github.token}`
      };

      
      const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      const data = repoRes.data;

      
      const contribRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
        { headers }
      );

      let contributors = [];
      let totalCommits = 0;


      if (Array.isArray(contribRes.data)) {
        contributors = contribRes.data.map(c => ({
          login: c.author?.login || 'inconnu',
          commits: c.total,
          avatar_url: c.author.avatar_url
        }));

        totalCommits = 0;
        for (let i = 0; i < contributors.length; i++) {
          totalCommits = totalCommits + contributors[i].commits;
        }
      }

      
      const contentsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
      const totalFiles = Array.isArray(contentsRes.data) ? contentsRes.data.length : 0;

      res.json({
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        language: data.language,
        contributors,
        totalCommits,
        totalFiles
      });

    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Erreur lors de la récupération du dépôt.' });
    }
  }
};

module.exports = githubController;
