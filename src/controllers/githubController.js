import axios from "axios";
import config from "../config/config.js";

const githubController = {
  getRepositories: async (req, res) => {
    try {
      const url = req.body.url || req.query.url;

      if (!url || !url.includes("github.com")) {
        return res.status(400).json({ error: "URL GitHub invalide." });
      }

      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return res.status(400).json({
          error: "Impossible d'extraire les infos du repo.",
        });
      }

      const owner = match[1];
      const repo = match[2];

      const headers = {
        Authorization: `Bearer ${config.github.token}`,
      };

      const repoRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        { headers }
      );
      const data = repoRes.data;

      const contribRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
        { headers }
      );
      
      let contributors = [];
      let totalCommits = 0;

      if (Array.isArray(contribRes.data)) {
        contributors = contribRes.data.map((c) => ({
          login: c.author?.login || "inconnu",
          commits: c.total,
          avatar_url: c.author.avatar_url,
        }));

        totalCommits = 0;
        for (let i = 0; i < contributors.length; i++) {
          totalCommits = totalCommits + contributors[i].commits;
        }
      }
      console.log("test");
      
      const contentsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
      const totalFiles = Array.isArray(contentsRes.data) ? contentsRes.data.length : 0;

      res.json({
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        language: data.language,
        contributors,
        totalCommits,
        totalFiles,
      });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération du dépôt." });
    }
  },

  getAllCommitsFromUser: async (req, res) => {
    const { owner, repo, author } = req.body;
    const urlArray = []
    try {
      const header = {
        headers: {
          Authorization: `token ${config.github.token}`
        }
      };
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?author=${author}`, header);
      const commitData = response.data;
      commitData.forEach(commit => {

        if (commit.parents.length < 2) urlArray.push(commit.url)
      })        
        const commitsContent = [];
        await Promise.all(
            urlArray.map(async (url) => {
                const commitDetails = await axios.get(url, header);
                const files = commitDetails.data.files;
                const maxLength = 2500;
                files.forEach(file => {
                    const ignoredFiles = ['node_modules', 'package-lock.json', 'package.json', 'README.md', 'config.js', '.gitignore', 'css'];
                    const shouldIgnore = ignoredFiles.some(ignored => file.filename.includes(ignored));
                    
                    if (file.patch && !shouldIgnore) {
                        commitsContent.push({
                            filename: file.filename,
                            content: file.patch?.slice(0, maxLength) || ''
                        });
                    }
                });
            })
        );
        const codeReview = await axios.post('http://localhost:10000/api/groq/review', commitsContent)
        res.json(codeReview.data)


    } catch (error) {
      console.error("Erreur lors de la récupération du commit:", error.message);
      throw error;
    }
  },

  getRepositoryCode: async (req, res) => {
    try {
      const url = req.body.url || req.query.url;

      if (!url || !url.includes("github.com")) {
        return res.status(400).json({ error: "URL GitHub invalide." });
      }

      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return res.status(400).json({
          error: "Impossible d'extraire les infos du repo.",
        });
      }

      const owner = match[1];
      const repo = match[2];

      const headers = {
        Authorization: `Bearer ${config.github.token}`,
      };

      console.log("Récupération du code du repository...");

      const repoCode = [];

      async function parcourirDossier(chemin) {
        const url =
          `https://api.github.com/repos/${owner}/${repo}/contents` + chemin;

        const response = await axios.get(url, { headers });
        const elements = response.data;

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];

          if (element.type === "file") {
            const fichiersAIgnorer = [
              "package.json",
              "package-lock.json",
              ".gitignore",
              "README.md",
              ".env",
            ];

            const extensionsAIgnorer = [".jpg", ".png", ".gif", ".pdf", ".zip"];

            let ignorerFichier = false;

            for (let j = 0; j < fichiersAIgnorer.length; j++) {
              if (element.name === fichiersAIgnorer[j]) {
                ignorerFichier = true;
                break;
              }
            }

            for (let k = 0; k < extensionsAIgnorer.length; k++) {
              if (element.name.endsWith(extensionsAIgnorer[k])) {
                ignorerFichier = true;
                break;
              }
            }

            if (!ignorerFichier) {
              console.log("Récupération du fichier:", element.path);

              const fileResponse = await axios.get(element.download_url, {
                headers,
              });
              const fileContent = fileResponse.data;

              repoCode.push({
                nom: element.name,
                chemin: element.path,
                contenu: fileContent,
              });
            }
          }

          if (element.type === "dir") {
            console.log("Parcours du dossier:", element.path);
            await parcourirDossier("/" + element.path);
          }
        }
      }

      await parcourirDossier("");

      console.log("Nombre de fichiers récupérés:", repoCode.length);

      res.json({ repoCode: repoCode });
    } catch (error) {
      console.error("Erreur lors de la récupération du repository:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du code" });
    }
  },
};

export default githubController;
