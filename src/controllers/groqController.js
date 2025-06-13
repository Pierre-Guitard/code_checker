// import Groq from "groq-sdk";
 
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// // Fonction pour nettoyer la réponse de Groq
// function cleanGroqResponse(message) {
//     try {
//         const content = message?.content || "";
//         // Essayer de parser le JSON
//         const jsonMatch = content.match(/\{[\s\S]*\}/);
//         if (jsonMatch) {
//             return JSON.parse(jsonMatch[0]);
//         }
//         return { error: "Réponse JSON non valide", raw_content: content };
//     } catch (error) {
//         return { error: "Erreur de parsing JSON", raw_content: message?.content || "" };
//     }
// }

// export async function testGroq() {
//     try {
//         // Créer un fichier de test simple pour la démo
//         const testFile = {
//             filename: 'src/controllers/githubController.js',
//             changes: 'nouveau fichier créé',
//             content: `@@ -0,0 +1,17 @@ +const config = require('../config/config'); + +const githubController = { + + getRepositories: async (req, res) => { + try { + // TODO: Implémenter la logique pour récupérer les repositories + res.json({ message: 'Liste des repositories' }); + } catch (error) { + res.status(500).json({ error: error.message }); + } + }, + + //TODO: Implémenter la logique pour récupérer les repositories et etc +}; + +module.exports = githubController; \\ No newline at end of file`
//         };

//         const result = await analyzeFile(testFile);
//         console.log("Résultat de l'analyse:", result);
//         return result;
//     } catch (error) {
//         console.error("Erreur Groq:", error);
//         throw error;
//     }
// }
 
// export async function getGroqChatCompletion() {
//     return groq.chat.completions.create({
//         messages: [
//             {
//                 role: "user",
//                 content: `Analyse ce fichier et réponds en JSON valide avec cette structure:
//     {
//       "file_analysis": {
//         "quality": "1-100",
//         "summary": "résumé court",
//         "suggestions": ["max 2 suggestions"],
//         "risks": ["max 1 risque"]
//       }
//     }
//     Note: La qualité doit être un nombre entre 1 et 100, où 100 représente une qualité exceptionnelle.

//     Fichier: src/controllers/githubController.js
//     Changements: modifications
//     Contenu modifié: @@ -0,0 +1,17 @@ +const config = require('../config/config'); + +const githubController = { + + getRepositories: async (req, res) => { + try { + // TODO: Implémenter la logique pour récupérer les repositories + res.json({ message: 'Liste des repositories' }); + } catch (error) { + res.status(500).json({ error: error.message }); + } + }, + + //TODO: Implémenter la logique pour récupérer les repositories et etc +}; + +module.exports = githubController; \\ No newline at end of file`,
//             },
//         ],
//         model: "llama-3.3-70b-versatile",
//     });
// }

// export async function analyzeFile(file) {
//     try {
//         const prompt = `Analyse ce fichier et réponds en JSON valide avec cette structure:
//         {
//           "file_analysis": {
//             "quality": "1-100",
//             "summary": "résumé court",
//             "suggestions": ["max 2 suggestions"],
//             "risks": ["max 1 risque"]
//           }
//         }
//         Note: La qualité doit être un nombre entre 1 et 100, où 100 représente une qualité exceptionnelle.
    
//         Fichier: ${file.filename}
//         Changements: ${file.changes}
//         Contenu: ${file.content}`;
    
//         const chatCompletion = await groq.chat.completions.create({
//             messages: [{ role: "user", content: prompt }],
//             model: "gemma2-9b-it",
//             temperature: 0.7,
//             max_tokens: 500,
//         });
    
//         return {
//             filename: file.filename,
//             analysis: cleanGroqResponse(chatCompletion.choices[0]?.message)
//         };
//     } catch (error) {
//         console.error(`Erreur lors de l'analyse du fichier ${file.filename}:`, error);
//         throw error;
//     }
// }



// import axios from 'axios';

// const groqController = {
    
//     analyseCommits: async (req, res) => {
//         console.log('ARRIVER DANS GROQCONTROLLER');
        
//         console.log("groqController", req.body);
        
//         const commitContents = req.body;
//         console.log(commitContents[0]);
        

//         try {
//         const analysisResults = await Promise.all(
//             commitContents.map(async (commit) => {
//                 const prompt = `Analyse ce commit fait par ${commit.author} le ${commit.date}. Contenu : ${JSON.stringify(commit.files)}.`;

//                 const response = await axios.post('https://api.groq.com/v1/chat/completions', {
//                     model: "llama-3.3-70b-versatile",
//                     messages: [
//                         { role: "user", content: prompt }
//                     ]
//                 }, {
//                     headers: {
//                         Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//                         "Content-Type": "application/json"
//                     }
//                 });

//                 return {
//                     original: commit,
//                     analysis: response.data.choices[0].message.content
//                 };
//             })
//         );

//         res.json(analysisResults);
//     } catch (error) {
//  console.error("Erreur Groq:", error.response?.data || error.message || error);
//     res.status(500).json({ error: 'Erreur durant l’analyse avec Groq.' });
//     }
// }
// }


import Groq from "groq-sdk";
 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const groqController = {
  analyseCommits: async (req, res) => {
    console.log("ARRIVER DANS LE CONTROLLER DEGROQ");
    // console.log(req.body);
    const commitsContent = req.body
    console.log("commitsContent = ", commitsContent);
  const formattedCode = commitsContent.map(file => {
        return `// ${file.filename}\n${file.content}`;
    }).join('\n\n');
    
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
            content: prompt
          }
        ]
      });
      console.log("LA REPONSE DE GROQ", response.choices);
      
      const message = response.choices?.[0]?.message?.content || "";

//       // Optionnel : extraction JSON propre depuis le message
      const jsonMatch = message.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: message };

      res.json({ result: analysis });

    } catch (error) {
      console.error("Erreur Groq:", error.message || error);
      res.status(500).json({ error: "Erreur lors de l'analyse par Groq." });
    }
  }
};

export default groqController;