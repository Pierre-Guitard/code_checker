require('dotenv').config();
console.log(process.env.GITHUB_TOKEN);

module.exports = {
    port: process.env.PORT || 3000,
    github: {
        token: process.env.GITHUB_TOKEN
    },
    // pas encore dispo dans le point en v a rajouter dans le .env
    groq: {
        apiKey: process.env.GROQ_API_KEY
    }
}; 