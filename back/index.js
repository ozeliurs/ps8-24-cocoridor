const back = require("./logic/back.js")
const adaptator = require("./logic/aiAdaptator.js")

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

async function saveGame(board,idUser,turnNb,playerList,gameId=null){
    let res = null;
    if(gameId===null){
        res = await apiQuery.createGame(idUser, board, turnNb, playerList);
    }else{
        res = await apiQuery.updateGame(idUser, board, turnNb, playerList, gameId);
    }
    return res;
}

async function getGame(idGame){
    let res = null;
    res = await apiQuery.getGame(idGame);
    return res;
}

io.of("/api/AIgame").on('connection', (socket) => {
    let playerList
    let board
    let turnNb
    
    
    socket.on('newGame',async (playerId) => {
        back.init();
        socket.emit("choosePos",back.setUpBoard(back.getPlayerList()[0]))

    })
    socket.on("gameSetup",async (move, playerId)=>{
        back.placePlayer(move.playerID,{X:move.x,Y:move.y})
        playerList = back.getPlayerList();
        board = back.getBoard();
        turnNb = back.getTurnNb();
        let aiMove = await adaptator.setup(2, back.setUpBoard(playerList[1]).Positions);
        back.placePlayer(playerList[1].id, aiMove);
        let  gameId = await saveGame(board, playerId, turnNb, playerList);
        let currentPlayer = playerList[turnNb % playerList.length]
        let newBoard =  back.setUpBoard(currentPlayer).Board;
        socket.emit("launch", newBoard, turnNb, gameId);
    })
    socket.on('retrieveGame', async (playerId, gameId) => {
        let game = await getGame(gameId);
        back.init(game[0].board.length, game[0].board[0].length, game[0].board, game[0].turnNb, game[0].playerList);
        playerList = back.getPlayerList();
        turnNb = back.getTurnNb();
        if(turnNb%playerList.length!==0){
            let aiBoard = back.BoardFor(playerList[1]);
            {
                sleep(1000)
                let moved
                let computemove = await adaptator.computeMove(aiBoard);
                console.log(computemove)
                if(computemove.vertical===undefined) {
                    moved = back.execMove(computemove.playerID, computemove.x, computemove.y);
                }else{
                    moved = back.execWall(computemove.playerID,computemove.x,computemove.y,computemove.vertical);
                }
                if (!moved) {
                    let move = back.execRandomMove(playerList[1].id);
                    await adaptator.correction(move);
                }
            }
            aiBoard = back.BoardFor(playerList[1]);
            await adaptator.updateBoard(aiBoard,playerList[1].id);
            board = back.getBoard();
            turnNb = back.getTurnNb();

            saveGame(board,playerId,turnNb,playerList,gameId);
        }
        let newBoard = back.BoardFor(playerList[turnNb%playerList.length]);
        socket.emit("launch", newBoard, turnNb, gameId);
    })

    socket.on('move', async (move, gameId, playerId) => {
        console.log('playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        let actionDone = back.execMove(move.playerID, move.x, move.y);
        if (actionDone) {
            board = back.getBoard();
            turnNb = back.getTurnNb();
            saveGame(board, playerId, turnNb, playerList, gameId);
            let newBoard = back.BoardFor(playerList[0]);
            socket.emit("updateBoard", newBoard);
            let aiBoard = back.BoardFor(playerList[1]);
            {
                sleep(1000)
                let moved
                let computemove = await adaptator.computeMove(aiBoard);
                console.log(computemove)
                if(computemove.vertical===undefined) {
                    moved = back.execMove(computemove.playerID, computemove.x, computemove.y);
                }else{
                    moved = back.execWall(computemove.playerID,computemove.x,computemove.y,computemove.vertical);
                }
                if (!moved) {
                    let move = back.execRandomMove(playerList[1].id);
                    await adaptator.correction(move);
                }
            }
            aiBoard = back.BoardFor(playerList[1]);
            await adaptator.updateBoard(aiBoard,playerList[1].id);
            board = back.getBoard();
            turnNb = back.getTurnNb();
            saveGame(board, playerId, turnNb, playerList, gameId);
            newBoard = back.BoardFor(playerList[0]);

            socket.emit("updateBoard", newBoard);
        }
        let winners = back.GameWinner();
        if (winners != null) {
            socket.emit("endGame", winners);
        }


    });

    socket.on('wall', async (wall, gameId, playerId) => {
        console.log('playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        let actionDone = back.execWall(wall.playerID, wall.x, wall.y, wall.vertical)


        if (actionDone) {
            board = back.getBoard();
            turnNb = back.getTurnNb();
            saveGame(board, playerId, turnNb, playerList, gameId);
            let newBoard = back.BoardFor(playerList[0]);
            socket.emit("updateBoard", newBoard);
            let aiBoard = back.BoardFor(playerList[1]);

            {
                sleep(1000)
                let moved
                let computemove = await adaptator.computeMove(aiBoard);
                console.log(computemove)
                if(computemove.vertical===undefined) {
                    moved = back.execMove(computemove.playerID, computemove.x, computemove.y);
                }else{
                    moved = back.execWall(computemove.playerID,computemove.x,computemove.y,computemove.vertical);
                }
                if (!moved) {
                    let move = back.execRandomMove(playerList[1].id);
                    await adaptator.correction(move);
                    console.log("correction : " + move);
                }
            }
            aiBoard = back.BoardFor(playerList[1]);
            await adaptator.updateBoard(aiBoard,playerList[1].id);
            board = back.getBoard();
            turnNb = back.getTurnNb();
            saveGame(board, playerId, turnNb, playerList, gameId);
            newBoard = back.BoardFor(playerList[0])
            socket.emit("updateBoard", newBoard)
        }

        let winners = back.GameWinner();
        if (winners != null) {
            socket.emit("endGame", winners);
        }
    });

});

io.of("/api/Localgame").on('connection', (socket) => {


    back.init()
    playerList = back.getPlayerList()
    boardHeight = back.getBoard().length
    boardLength = back.getBoard()[0].length
    back.placePlayer(playerList[0].id,{X:Math.floor(boardLength/2),Y:0})
    back.placePlayer(playerList[1].id,{X:Math.floor((boardLength/2)+0.5)-1,Y:boardHeight-1})
    turnNb = back.getTurnNb()
    let newBoard = back.BoardFor(playerList[0])
    socket.emit("launch",newBoard,turnNb);

    socket.on('move', (move,gameId,playerId) => {
        console.log('playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        let actionDone = back.execMove(move.playerID,move.x,move.y);
        if(actionDone){
            let newBoard = back.BoardFor(back.CurrentPlayer());
            socket.emit("updateBoard",newBoard);
        }
        let winners = back.GameWinner();
        if(winners !=null){
            socket.emit("endGame", winners);
        }


    });

    socket.on('wall', (wall,playerId,gameId) => {
        console.log('playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
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


io.of("/api/testgame").on('connection', (socket) => {

    let playerList = back.init()

    let newBoard = back.BoardFor(playerList[0])
    socket.emit("launch",newBoard)
    console.log('a user connected api');


    socket.on("action",(action)=>{
        let actionDone = false;
        switch(action.vertical){
            case null:
                actionDone = back.execMove(move.playerID,move.x,move.y);
                break;
            case true :
            case false :
                actionDone = back.execWall(wall.playerID,wall.x,wall.y,wall.vertical)
                break;
        }
        if(actionDone){
            let newBoard = back.BoardFor(back.CurrentPlayer());
            socket.emit("updateBoard",newBoard);
        }

        // Save Game



        let winners = back.GameWinner();
        if(winners !=null) socket.emit("endGame", winners);
    })
});
let players = [];

io.of("/api/1vs1").on('connection', async (socket) => {
    let myId = 0;
    let playerList;
    let board;
    let turnNb;
    let gameId;
    socket.on('sendInfo', async (playerid) => {
        console.log("playerid: "+playerid)
        let alreadyIn = false;
        for(let i = 0; i < players.length; i++){
            if(players[i].id === playerid){
                players[i].socket.disconnect();
                players[i].socket = socket;
                console.log("player updated")
                alreadyIn = true;
            }
        }
        if(!alreadyIn){
            players.push({id: playerid, socket: socket});
            console.log("player added")
        }
         console.log("players: "+players.length)
         if (players.length === 2) {
             myId = 1;
             back.init();
             for (let i = 0; i < players.length; i++) {
                 back.placePlayer(i+1, {X: (i) * 8, Y: (i) * 8});
             }
             playerList = back.getPlayerList();
             board = back.getBoard();
             turnNb = back.getTurnNb();
             gameId = await saveGame(board, playerList[0], turnNb, playerList);
             for(let i = 0; i < players.length; i++){
                 players[i].socket.join('room'+gameId);
             }
             io.of("/api/1vs1").to('room'+gameId).emit("ready", gameId);
             console.log("game created")
             players = [];
         }
    });
    socket.on('move', async (move, gameId, playerId) => {
        console.log('playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        if(myId === turnNb % playerList.length) {
            let actionDone = back.execMove(move.playerID, move.x, move.y);
            if (actionDone) {
                board = back.getBoard();
                turnNb = back.getTurnNb();
                await saveGame(board, playerId, turnNb, playerList, gameId);
                io.of("/api/1vs1").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('wall', async (wall, gameId, playerId) => {
        console.log('playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        if(myId === turnNb % playerList.length) {
            let actionDone = back.execWall(wall.playerID, wall.x, wall.y, wall.vertical)
            if (actionDone) {
                board = back.getBoard();
                turnNb = back.getTurnNb();
                await saveGame(board, playerId, turnNb, playerList, gameId);
                io.of("/api/1vs1").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('update', async (gameId) => {
        turnNb = back.getTurnNb();
        let newBoard = back.BoardFor(playerList[myId]);
        socket.emit("updateBoard", newBoard);
        let winners = back.GameWinner();
        if (winners != null) {
            socket.emit("endGame", winners);
        }
    });
    socket.on('start', async (gameId) => {
        playerList= back.getPlayerList();
        turnNb= back.getTurnNb();
        board= back.getBoard();
        console.log("id: "+myId);
        let newBoard = back.BoardFor(playerList[myId]);
        socket.emit("launch", newBoard, back.getTurnNb(), gameId);
    });
});





