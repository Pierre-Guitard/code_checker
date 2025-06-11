const express = require('express')
const config = require('./src/config/config')
const githubRoutes = require('./src/routes/githubRoutes')
const groqRoutes = require('./src/routes/groqRoutes')

const app = express()

app.use(express.json())
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