import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    github: {
        token: process.env.GITHUB_TOKEN
    },
    groq: {
        apiKey: process.env.GROQ_API_KEY
    }
}; 