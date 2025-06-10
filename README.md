Pour lancer le projet de votre coté : 

-pour creer un volume: docker volume create volume-test
-lancer docker build -t code_checker .
-lancer docker run -d -p 3000:3000 code_checker -v volume-app (pour lancer l'app avec le volume)