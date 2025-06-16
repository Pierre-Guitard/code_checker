**CODE CHECKER**


1. Cloner le repo en local

2. Creer un fichier .env
-Vous devez creer 2 variable d'envionnement à savoir:

    GROQ_API_KEY (https://console.groq.com/keys)
    et
    GITHUB_TOKEN (https://github.com/settings/keys)

3. Pour lancer le projet de votre coté : 

-lancer docker build -t code_checker .
-lancer docker run -d -p 3000:3000 code_checker -v volume-app (pour lancer l'app avec le volume)


# Description rapide du projet: 

    -Dans .gitgub/workflows se trouve le fichier pour la CI GitHub

    -Le dossier front/vue contient les pages html (le css est dans le dossier public)

    -le dossier tests contient les tests du projet

    -server.js configure et demmarre le serveur express

    Dans le fichier src on trouve 3 dossiers: 
        -config (qui permet de charger les variables d'environements)

        -controller (contient nos 2 controllers avec la logique de concernant la communication avec l'api GitHub et Groq respectivement )

        -routes (contient respectivement les routes de l'api express lié)
