import Groq from "groq-sdk";
import config from '../config/config.js';

const groq = new Groq({ apiKey: config.groq.apiKey });

const groqController = {
  analyseCommits: async (req, res) => {;
    const commitsContent = req.body

    try {
    const prompt = `
    Analyse l'ensemble de ces commits, fournis 4 elements en repondant EN JSON:
    1. Une note sur 10, en prenant en compte que le contributeur est de niveau bac+3
    2. La probabilité en pourcentage que le code soit généré par IA
    3. Résumé des points forts et des points faibles
    4. 1 ou 2 suggestions d'amélioration
    
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
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "user", content: prompt },
            { role: "user", content: JSON.stringify(commitsContent) }
        ]
      });

      const message = response.choices?.[0]?.message?.content || "";
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