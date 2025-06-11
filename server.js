const express = require('express')
const config = require('./src/config/config')
const githubRoutes = require('./src/routes/githubRoutes')
const groqRoutes = require('./src/routes/groqRoutes')
const cors = require('cors')
const path = require('path')
const app = express()


app.use(express.static(path.join(__dirname, 'front/vue')));
app.use('/public', express.static(path.join(__dirname, 'front/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front/vue/index.html'));
});
app.use(express.json())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use('/api/github', githubRoutes)
app.use('/api/groq', groqRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API de vérification de code' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Une erreur est survenue!' })
})

app.listen(config.port, () => {
  console.log(`Serveur démarré sur le port ${config.port}`)
})