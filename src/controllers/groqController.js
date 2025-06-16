import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const groqController = {
  analyseCommits: async (req, res) => {
    const commitsContent = req.body;
    const formattedCode = commitsContent
      .map((file) => {
        return `// ${file.filename}\n${file.content}`;
      })
      .join("\n\n");
    try {
      const prompt = `Voici tous le code produit:
    Analyse l'ensemble de ces commits, tu fourniras 4 elements en repondant UNIQUEMENT EN JSON:
    1. Une note sur 5, en prenant en compte que le contributeur est de niveau bac+3
    2. La probabilité en pourcentage que le code soit généré par IA
    3. Résumé des points forts et des points faibles
    4. 1 ou 2 suggestions d'amélioration
    
    voici le code de l'auteur ${formattedCode}
    Voici un exemple de la structure que tu dois adopter: 
    {
        "score": 3,
        "ai_probability": "25%",
        "strengh_weakness": "Le code est bien structuré, avec...",
        "suggestions": [
            "Ajouter des commentaires plus explicites",
            "meilleur gestion des call api"
        ]
    }
    `;
      const response = await groq.chat.completions.create({
        model: "gemma2-9b-it",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      const message = response.choices?.[0]?.message?.content || "";
      const jsonMatch = message.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: message };
      res.json({ result: analysis });
    } catch (error) {
      console.error("Erreur Groq:", error.message || error);
      res.status(500).json({ error: "Erreur lors de l'analyse par Groq." });
    }
  },

  // Fonction pour nettoyer la réponse de Groq
  cleanGroqResponse: (message) => {
    try {
        const content = message?.content || "";
        
        // Nettoyer les backticks et les espaces superflus
        const cleanedContent = content.replace(/```/g, '').trim();
        
        // Chercher le JSON dans le contenu nettoyé
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                return { 
                    error: "Erreur de parsing JSON", 
                    raw_content: cleanedContent 
                };
            }
        }
        
        return { 
            error: "Réponse JSON non valide", 
            raw_content: cleanedContent 
        };
    } catch (error) {
        console.error('Erreur dans cleanGroqResponse:', error);
        return { 
            error: "Erreur de traitement de la réponse", 
            raw_content: message?.content || "" 
        };
    }
  },

  analyzeRepository: async (repoCode) => {
    try {
        console.log('Préparation du code pour Groq...');
        console.log('Nombre de fichiers à analyser:', repoCode.length);
        
        // Mettre tout le code ensemble avec limitation
        let toutLeCode = '';
        let nombreFichiersTraites = 0;
        const maxCaracteres = 10000; // Limiter à 10k caractères
        
        for (let i = 0; i < repoCode.length && toutLeCode.length < maxCaracteres; i++) {
            const fichier = repoCode[i];
            const contenuFichier = 'FICHIER: ' + fichier.chemin + '\n' + fichier.contenu + '\n\n';
            
            if (toutLeCode.length + contenuFichier.length < maxCaracteres) {
                toutLeCode += contenuFichier;
                nombreFichiersTraites++;
            } else {
                break;
            }
        }
        
        console.log('Fichiers traités:', nombreFichiersTraites, '/', repoCode.length);
        console.log('Taille totale du code:', toutLeCode.length, 'caractères');
        
        // Créer un prompt plus court et plus direct
        const prompt = `Analyse ce code d'étudiant BAC+3 et réponds en JSON uniquement :

${toutLeCode}

Réponds avec ce format JSON exact (sans backticks) :
{
  "note_globale": 75, 
  "analyse": "ton analyse", 
  "points_positifs": ["point1"], 
  "points_negatifs": ["point1"], 
  "suggestions": ["suggestion1"], 
  "probabilite_ia": 30, 
  "raisons_ia": ["raison1"],
  "quizz": [
    {
      "question": "Question basée sur le code analysé ?",
      "reponses_possibles": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
      "bonne_reponse": ["Réponse B"]
    }
  ]
}

IMPORTANT: Génère exactement 10 questions de quiz basées sur le code analysé. Chaque question doit avoir 4 réponses possibles et 1 bonne réponse. Les questions doivent porter sur les bonnes pratiques, les erreurs trouvées, les technologies utilisées, et les améliorations suggérées dans ce code spécifique.`;

        console.log('Taille du prompt final:', prompt.length, 'caractères');
        console.log('Envoi à Groq...');
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gemma2-9b-it",
            temperature: 0.1,
            max_tokens: 1500,
        });

        // Traitement normal maintenant que ça fonctionne
        const rawResponse = chatCompletion.choices[0]?.message?.content || "Aucune réponse";
        console.log('Réponse brute de Groq:', rawResponse);
        
        // Essayer de parser directement la réponse JSON
        try {
            const jsonResponse = JSON.parse(rawResponse);
            return jsonResponse;
        } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            // Si ça échoue, utiliser la fonction de nettoyage
            return groqController.cleanGroqResponse(chatCompletion.choices[0]?.message);
        }
    
    } catch (error) {
        console.error('Erreur lors de l\'analyse du repository:', error);
        throw error;
    }
  },

  analyzeRepositoryRoute: async (req, res) => {
    try {
      const repoCode = req.body;
      console.log("Route analyze-repository appelée avec", repoCode?.length, "fichiers");
      
      const analysis = await groqController.analyzeRepository(repoCode);
      res.json({ result: analysis });
    } catch (error) {
      console.error("Erreur lors de l'analyse du repository:", error);
      res.status(500).json({ error: "Erreur lors de l'analyse du repository." });
    }
  },
};

export default groqController;
