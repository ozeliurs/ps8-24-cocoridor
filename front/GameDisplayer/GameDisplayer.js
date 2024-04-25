
document.addEventListener('DOMContentLoaded', async function() {
    let usernameCookie = document.cookie.split('; ').find(row => row.startsWith('nomCookie='))
    let user = null
    if (usernameCookie)user = usernameCookie.split("=")[1]
    if (!user) {
        alert("Vous n'êtes pas connecté");
        window.location.href = "../index.html";
        return;
    }
    let games = [];
    let req = {
        idUser: user
    }
    const hostname = window.location.hostname;
    const api = "http://"+hostname+":8000/api/retrieveUserGames";
    fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => {
        if (response.ok) {
            return response.json(); // Convertit la réponse en JSON
        } else {
            throw new Error('La requête a échoué'); // Gestion des erreurs
        }
    }).then(data => {

        games = data;
        let gameList = document.getElementById("gameList");
        for (let i = 0; i < games.length; i++) {
            let game = games[i];
            let gameElement = document.createElement("div");
            gameElement.className = "game";
            gameElement.innerHTML = "Game " + i + " : " + game._id + " (cliquer pour rejoindre)";

            gameElement.onclick = function(){
                window.location.href = "../Game-Page?mode=getAi&gameid="+game._id+"&playerid="+user;
            }
            gameList.appendChild(gameElement);
        }
    }).catch(error => {
        console.error('Erreur:', error);
    });

});


