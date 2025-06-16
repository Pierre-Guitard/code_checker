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
        const codeReview = await axios.post('http://localhost:3000/api/groq/review', commitsContent)
        res.json(codeReview.data)


    } catch (error) {
      console.error("Erreur lors de la récupération du commit:", error.message);
      throw error;
    }
  },

  // Fonction qui récupère le code source complet d’un repository GitHub public via l’API GitHub
  getRepositoryCode: async (req, res) => {
    try {
      // Récupère l'URL du repo depuis le corps de la requête ou les paramètres (GET ou POST)
      const url = req.body.url || req.query.url;

      // Si l’URL n’est pas définie ou n’est pas une URL GitHub, retourne une erreur 400
      if (!url || !url.includes("github.com")) {
        return res.status(400).json({ error: "URL GitHub invalide." });
      }

      // Utilise une expression régulière pour extraire le propriétaire et le nom du repo depuis l’URL
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return res.status(400).json({
          error: "Impossible d'extraire les infos du repo.",
        });
      }

      // Déstructure les résultats : owner = utilisateur / orga, repo = nom du projet
      const owner = match[1];
      const repo = match[2];

      // Prépare les headers d’authentification pour GitHub (token stocké dans la config)
      const headers = {
        Authorization: `Bearer ${config.github.token}`,
      };

      console.log("Récupération du code du repository...");

      // Contiendra tous les fichiers récupérés
      const repoCode = [];

      // Fonction récursive pour parcourir tous les dossiers/fichiers du repo
      async function parcourirDossier(chemin) {
        // Construit l’URL GitHub API pour accéder au contenu du dossier courant
        const url =
          `https://api.github.com/repos/${owner}/${repo}/contents` + chemin;

        // Appelle l’API GitHub pour obtenir les fichiers et dossiers à cet emplacement
        const response = await axios.get(url, { headers });
        const elements = response.data; // Liste des fichiers/dossiers à cet endroit

        // Parcourt chaque élément (fichier ou dossier)
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];

          // Si c’est un fichier
          if (element.type === "file") {
            // Liste des fichiers à ignorer par nom exact
            const fichiersAIgnorer = [
              "package.json",
              "package-lock.json",
              ".gitignore",
              "README.md",
              ".env",
            ];

            // Liste des extensions à ignorer (fichiers binaires ou non pertinents)
            const extensionsAIgnorer = [".jpg", ".png", ".gif", ".pdf", ".zip"];

            let ignorerFichier = false;

            // Vérifie si le nom du fichier correspond à un fichier à ignorer
            for (let j = 0; j < fichiersAIgnorer.length; j++) {
              if (element.name === fichiersAIgnorer[j]) {
                ignorerFichier = true;
                break;
              }
            }

            // Vérifie si le fichier a une extension à ignorer
            for (let k = 0; k < extensionsAIgnorer.length; k++) {
              if (element.name.endsWith(extensionsAIgnorer[k])) {
                ignorerFichier = true;
                break;
              }
            }

            // Si le fichier est autorisé
            if (!ignorerFichier) {
              console.log("Récupération du fichier:", element.path);

              // Télécharge le contenu brut du fichier
              const fileResponse = await axios.get(element.download_url, {
                headers,
              });
              const fileContent = fileResponse.data;

              // Ajoute le fichier à la liste finale avec ses infos
              repoCode.push({
                nom: element.name, // Nom du fichier (ex: "index.js")
                chemin: element.path, // Chemin complet dans le repo (ex: "src/index.js")
                contenu: fileContent, // Contenu brut du fichier
              });
            }
          }

          // Si c’est un dossier, appel récursif pour descendre dans l’arborescence
          if (element.type === "dir") {
            console.log("Parcours du dossier:", element.path);
            await parcourirDossier("/" + element.path); // Ajoute un "/" pour naviguer
          }
        }
      }

      // Lancement de la récupération à partir de la racine du repo
      await parcourirDossier("");

      // Affiche le nombre total de fichiers récupérés
      console.log("Nombre de fichiers récupérés:", repoCode.length);

      // Renvoie la réponse JSON contenant tous les fichiers et leur contenu
      res.json({ repoCode: repoCode });
    } catch (error) {
      // En cas d’erreur : log l’erreur dans la console
      console.error("Erreur lors de la récupération du repository:", error);

      // Envoie une erreur 500 au client
      res.status(500).json({ error: "Erreur lors de la récupération du code" });
    }
  },
};

export default githubController;
