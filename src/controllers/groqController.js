import Groq from "groq-sdk";
 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fonction pour nettoyer la réponse de Groq
function cleanGroqResponse(message) {
    try {
        const content = message?.content || "";
        // Essayer de parser le JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { error: "Réponse JSON non valide", raw_content: content };
    } catch (error) {
        return { error: "Erreur de parsing JSON", raw_content: message?.content || "" };
    }
}

export async function testGroq() {
    try {
        // Créer un fichier de test simple pour la démo
        const testFile = {
            filename: 'src/controllers/githubController.js',
            changes: 'nouveau fichier créé',
            content: `@@ -0,0 +1,17 @@ +const config = require('../config/config'); + +const githubController = { + + getRepositories: async (req, res) => { + try { + // TODO: Implémenter la logique pour récupérer les repositories + res.json({ message: 'Liste des repositories' }); + } catch (error) { + res.status(500).json({ error: error.message }); + } + }, + + //TODO: Implémenter la logique pour récupérer les repositories et etc +}; + +module.exports = githubController; \\ No newline at end of file`
        };

        const result = await analyzeFile(testFile);
        console.log("Résultat de l'analyse:", result);
        return result;
    } catch (error) {
        console.error("Erreur Groq:", error);
        throw error;
    }
}
 
export async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Analyse ce fichier et réponds en JSON valide avec cette structure:
    {
      "file_analysis": {
        "quality": "1-100",
        "summary": "résumé court",
        "suggestions": ["max 2 suggestions"],
        "risks": ["max 1 risque"]
      }
    }
    Note: La qualité doit être un nombre entre 1 et 100, où 100 représente une qualité exceptionnelle.

    Fichier: src/controllers/githubController.js
    Changements: modifications
    Contenu modifié: @@ -0,0 +1,17 @@ +const config = require('../config/config'); + +const githubController = { + + getRepositories: async (req, res) => { + try { + // TODO: Implémenter la logique pour récupérer les repositories + res.json({ message: 'Liste des repositories' }); + } catch (error) { + res.status(500).json({ error: error.message }); + } + }, + + //TODO: Implémenter la logique pour récupérer les repositories et etc +}; + +module.exports = githubController; \\ No newline at end of file`,
            },
        ],
        model: "llama-3.3-70b-versatile",
    });
}

export async function analyzeFile(file) {
    try {
        const prompt = `Analyse ce fichier et réponds en JSON valide avec cette structure:
        {
          "file_analysis": {
            "quality": "1-100",
            "summary": "résumé court",
            "suggestions": ["max 2 suggestions"],
            "risks": ["max 1 risque"]
          }
        }
        Note: La qualité doit être un nombre entre 1 et 100, où 100 représente une qualité exceptionnelle.
    
        Fichier: ${file.filename}
        Changements: ${file.changes}
        Contenu: ${file.content}`;
    
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gemma2-9b-it",
            temperature: 0.7,
            max_tokens: 500,
        });
    
        return {
            filename: file.filename,
            analysis: cleanGroqResponse(chatCompletion.choices[0]?.message)
        };
    } catch (error) {
        console.error(`Erreur lors de l'analyse du fichier ${file.filename}:`, error);
        throw error;
    }
}