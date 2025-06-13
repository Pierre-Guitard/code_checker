import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import githubRoutes from './src/routes/githubRoutes.js'
import groqRoutes from './src/routes/groqRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'front/vue')));
app.use('/public', express.static(path.join(__dirname, 'front/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front/vue/dashboard.html'));
});
app.use(express.json())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use('/api/github', githubRoutes)
app.use('/api/groq', groqRoutes)

app.get('/test-groq', (req, res) => {
  res.render('testGroq')
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Une erreur est survenue!' })
})

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`)
})