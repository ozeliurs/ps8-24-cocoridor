const back = require("./logic/back.js")
const ai = require("./logic/ai.js")

// The http module contains methods to handle http queries.
const http = require('http')
// Let's import our logic.
const fileQuery = require('./queryManagers/front.js')
const apiQuery = require('./queryManagers/api.js')


/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */


const server=http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
        }
    } catch(error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8000);

const { Server } = require("socket.io");
const {CurrentPlayer} = require("./logic/back");
const io = new Server(server);



// Fonction qui attend le délai spécifié (en millisecondes)

function sleep(milliseconds) {
    const startTime = Date.now();
    while (Date.now() - startTime < milliseconds) {}
}

//Fonction qui envoie une requête à la db pour enregistrer l'état d'une partie

function saveGame(board,idUser,turnNb,playerList,gameId=null){
    if(gameId==null){
        let game = {
            board: board,
            idUser: idUser,
            turnNb: turnNb,
            playerList: playerList
        };
        fetch('http://localhost:8000/api/savegame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(game)
        }).then(response => {
            if (response.ok) {
                console.log("partie sauvegardée");
            } else {
                throw new Error('La requête a échoué'); // Gestion des erreurs
            }
        })
    }else{
        let game = {
            board: board,
            idUser: idUser,
            turnNb: turnNb,
            playerList: playerList,
            gameId:gameId
        };
        fetch('http://localhost:8000/api/savegame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(game)
        }).then(response => {
            if (response.ok) {
                console.log("partie sauvegardée");
            } else {
                throw new Error('La requête a échoué'); // Gestion des erreurs
            }
        })
    }
}

function getGame(gameId){
    fetch('http://localhost:8000/api/savegame', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameId)
    }).then(response => {
        if (response.ok) {
            console.log("partie récupéré");
            return response.body;
        } else {
            throw new Error('La requête a échoué'); // Gestion des erreurs
        }
    })
    return null;

}

io.of("/api/AIgame").on('connection', (socket) => {

    socket.on('newGame',(playerId)=>{
        back.init();
        let playerList = back.getPlayerList();
        let board = back.getBoard();
        let turnNb = back.getTurnNb();
        saveGame(board,playerId,turnNb,playerList);
        let newBoard = back.BoardFor(playerList[0]);
        socket.emit("launch", newBoard,turnNb);
    });
    socket.on('retrieveGame', (playerId,gameId)=>{
        game = getGame(gameId);
        back.init(11,11,game.board,game.turnNb,game.playerList);
        let newBoard = back.BoardFor(playerList[0]);
        socket.emit("launch", newBoard,turnNb);
    })

    socket.on('move', (move) => {
        console.log('move: ' + move, 'playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        let actionDone = back.execMove(move.playerID,move.x,move.y);
        let newBoard = back.BoardFor(playerList[0]);
        if(actionDone){

            socket.emit("updateBoard",newBoard);
            let aiBoard = back.BoardFor(playerList[1]);
           {
                sleep(1000)
                let moved

                do{
                    let computemove = ai.computeMove(aiBoard);
                    moved = back.execMove(computemove.playerID,computemove.x,computemove.y);
                } while(!moved)
            }
            newBoard = back.BoardFor(playerList[0]);

            socket.emit("updateBoard",newBoard);
        }
        let winners = back.GameWinner();
        if(winners != null){
            socket.emit("endGame", winners);
        }
        
       
    });

    socket.on('wall', (wall) => {
        console.log('wall: ' + wall, 'playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        let actionDone = back.execWall(wall.playerID,wall.x,wall.y,wall.vertical)
        let newBoard = back.BoardFor(playerList[0]);

        if(actionDone){
            socket.emit("updateBoard",newBoard);
            let aiBoard = back.BoardFor(playerList[1]);

            {
                sleep(1000)
                let moved
            do{
                let computemove = ai.computeMove(aiBoard);
                moved = back.execMove(computemove.playerID,computemove.x,computemove.y);
            } while(!moved)
        }

            newBoard = back.BoardFor(playerList[0])
            socket.emit("updateBoard",newBoard)
        }
        
        let winners = back.GameWinner();
        if(winners !=null){
            socket.emit("endGame", winners);
        }
    });

});

io.of("/api/Localgame").on('connection', (socket) => {


    let playerList = back.init()

    let newBoard = back.BoardFor(playerList[0])
    socket.emit("launch",newBoard)
    console.log('a user connected api');

    socket.on('move', (move) => {
        console.log('move: ' + move, 'playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        let actionDone = back.execMove(move.playerID,move.x,move.y);
        if(actionDone){

            let newBoard = back.BoardFor(back.CurrentPlayer());
            socket.emit("updateBoard",newBoard);
        }
        let winners = back.GameWinner();
        console.log(winners)
        if(winners !=null){
            socket.emit("endGame", winners);
        }


    });

    socket.on('wall', (wall) => {
        console.log('wall: ' + wall, 'playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        let actionDone = back.execWall(wall.playerID,wall.x,wall.y,wall.vertical)
        
        if(actionDone){
            let newBoard = back.BoardFor(back.CurrentPlayer());
            socket.emit("updateBoard",newBoard);
        }
        let winners = back.GameWinner();
        if(winners !=null){
            socket.emit("endGame", winners);
        }
    });

});

