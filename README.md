# ft_transcendence
![t4_home](https://github.com/user-attachments/assets/2c18b7dd-40a7-41ef-9123-ce15e2a23aa5)

## Description
ft_transcendence est un site web dédié au jeu mythique Pong.
Ce projet combine les concepts de développement web moderne avec des fonctionnalités avancées de sécurité,
de gestion d'utilisateurs, et d'expérience de jeu.

Le site permet aux joueurs de s'inscrire, de participer à des parties en direct, de créer des tournois, et d'affronter des adversaires humains ou contrôlés par l'IA.

## Fonctionnalités principales
### Jeu Pong
- Parties en direct : Affrontez un autre joueur sur le même clavier ou jouez contre une IA.
- Compatibilité multiplateforme : Fonctionne sur les navigateurs modernes comme Google Chrome et Firefox.
- Personnalisation : Les joueurs peuvent personnaliser certains aspects visuels du jeu (via des options intégrées).
![t5_jeu](https://github.com/user-attachments/assets/3a6e5b0b-413e-4547-ae68-22fcb130ef5f)

### Tournois
- Système de matchmaking : Organisation automatique des matchs entre les participants.
- Tableau des scores : Affichage clair des affrontements, des résultats, et de l'ordre des joueurs.
- Alias temporaires : Système de noms d'utilisateur réinitialisé à chaque tournoi.
![t6_tournament](https://github.com/user-attachments/assets/1804d68c-56d0-43c4-9100-54a7bd00361f)

### Gestion des utilisateurs
- Inscription et connexion : Gestion des utilisateurs avec authentification sécurisée (par JWT et 2FA).
![t2](https://github.com/user-attachments/assets/ea6fd058-9153-4222-b106-f8bfacce3643)
- Tableaux de bord : Statistiques utilisateur et historiques des matchs.
![tx_profile](https://github.com/user-attachments/assets/986d3977-960f-41c5-b2a1-5fb18918942b)

### Sécurité
- Connexion HTTPS : Toutes les communications utilisent des connexions sécurisées.
- Protection contre les attaques : Prévention des injections SQL, XSS.
- Hachage des mots de passe : Les mots de passe sont stockés de manière sécurisée.

### Architecture
- Backend en microservices : Développé avec Django.
- Base de données MySQL : Stockage des données utilisateur, des matchs, et des statistiques.
- Single Page Application (SPA) : Navigation fluide sans rechargement de page, compatible avec les boutons Précédent et Suivant du navigateur.

## Technologies utilisées
### Frontend
- JavaScript et Three.js : Pour le développement du jeu et des animations.
- HTML5 & CSS3 : Construction d'une interface utilisateur moderne.

### Backend
- Django : Framework pour le backend.
- MySQL : Base de données relationnelle.

### Conteneurisation
- Docker : L'ensemble du projet est déployé dans des conteneurs via Docker Compose pour un démarrage rapide.

## Fonctionnement
- Si vous voulez tester le projet, il vous faudra ajouter un fichier nommer .env dans le dossier **srcs** et le remplir comme ceci :
  ![demo_env](https://github.com/user-attachments/assets/73d7b587-726a-4e10-b4fa-a75a2c0e8a2c)
  notes: N'oubliez pas d'ajouter le certificat ssl et sa cle.
-Plus qu'a faire make.


### Contributor
- [tomteixeira](https://github.com/tomteixeira)
- [Alexisflore](https://github.com/Alexisflore)
- [AmauryVALLET](https://github.com/AmauryVALLET)
- [vetuedenoir](https://github.com/vetuedenoir)
- [RaphRsl](https://github.com/RaphRsl)
