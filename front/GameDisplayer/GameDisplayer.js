
const urlParams = new URLSearchParams(window.location.search);
const playerid = urlParams.get('playerid');

let games = [];
let req = {
    idUser: playerid
}


fetch('http://localhost:8000/api/retrieveUserGames', {
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
    console.log(games);
    let gameList = document.getElementById("gameList");
    for (let i = 0; i < games.length; i++) {
        let game = games[i];
        let gameElement = document.createElement("div");
        gameElement.innerHTML = "Game " + i + " : " + game._id;
        gameElement.onclick = function(){
            window.location.href = "../Game-Page?mode=getAi&gameid="+game._id+"&playerid="+playerid;
        }
        gameList.appendChild(gameElement);
    }
}).catch(error => {
    console.error('Erreur:', error);
});
