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
    let gameId
    let saveId
    let myId
    
    socket.on('newGame',async (playerId) => {
        gameId = back.init();
        myId = playerId
        back.setPlayers(gameId,[new back.PlayerAccount(playerId,"cc"), back.PlayerAccount.Bot()])
        playerList= back.getPlayerList(gameId);
        let me = null
        let playerListId = [];
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId) me = playerList[i];
            else if(playerList[i].account.difficulty!=null){
                let aiMove = await adaptator.setup(playerList[i].modifier, back.setUpBoard(gameId,playerList[i]).Positions);
                console.log("PLACE BOT")
                back.placePlayer(gameId, playerList[i].getid(), aiMove);
            }
            playerListId.push(playerList[i].getid())
        }
        socket.emit("choosePos",back.setUpBoard(gameId,me),playerListId,turnNb = back.getTurnNb(gameId))

    })
    socket.on("start",async ()=>{
        console.log("start")
        playerList = back.getPlayerList(gameId);
        board = back.getBoard(gameId);
        turnNb = back.getTurnNb(gameId);
        
        saveId = await saveGame(board, myId, turnNb, playerList);
        let me = null
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        
        socket.emit("launch", back.setUpBoard(gameId,me).Board, turnNb, gameId);
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

            saveGame(board,playerId,turnNb,playerList,saveId);
        }
        let newBoard = back.BoardFor(playerList[turnNb%playerList.length]);
        socket.emit("launch", newBoard, turnNb, gameId);
    })
    socket.on('move', async (move) => {
        console.log('x: ' + move.x, 'y: ' + move.y);
        playerList = back.getPlayerList(gameId)
        let me = playerList[turnNb%playerList.length]
        if(me.getid()!=myId){console.log("CANCEL");return;};
        
        let actionDone = back.execMove(gameId, me, move.x, move.y);
        if (actionDone) {
            board = back.getBoard(gameId);
            saveGame(board, myId, turnNb, playerList, saveId);
            let newBoard = back.BoardFor(gameId, me);
            turnNb = back.getTurnNb(gameId);
            socket.emit("updateBoard", newBoard,turnNb);
            while(playerList[turnNb%playerList.length].account.difficulty!=null){
                let bot = playerList[turnNb%playerList.length]
                let aiBoard = back.BoardFor(gameId, bot);
                {
                    sleep(1000)
                    let moved
                    let computemove = await adaptator.computeMove(aiBoard,bot.getid());
                    if(computemove.vertical===undefined) {
                        moved = back.execMove(gameId, me, computemove.x, computemove.y);
                    }else{
                        moved = back.execWall(gameId, me,computemove.x,computemove.y,computemove.vertical);
                    }
                    if (!moved) {
                        let move = back.execRandomMove(gameId, bot.getid());
                        await adaptator.correction(move);
                    }
                }
                aiBoard = back.BoardFor(gameId, playerList[1]);
                await adaptator.updateBoard(aiBoard,playerList[turnNb%playerList.length]);
                board = back.getBoard(gameId);
                turnNb = back.getTurnNb(gameId);
                saveGame(board, myId, turnNb, playerList, saveId);
                newBoard = back.BoardFor(gameId, me.getid());

                socket.emit("updateBoard", newBoard, turnNb);

            }
            
        }
        let winners = back.GameWinner();
        if (winners != null && winners.length!=0) {
            socket.emit("endGame", winners);
        }


    });

    socket.on('wall', async (wall) => {
        console.log('x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        let actionDone = back.execWall(wall.playerID, wall.x, wall.y, wall.vertical)


        if (actionDone) {
            board = back.getBoard();
            turnNb = back.getTurnNb();
            saveGame(board, myId, turnNb, playerList, saveId);
            let newBoard = back.BoardFor(playerList[0]);
            socket.emit("updateBoard", newBoard, turnNb);
            let aiBoard = back.BoardFor(playerList[1]);

            {
                sleep(1000)
                let moved
                let computemove = await adaptator.computeMove(aiBoard);
                if(computemove.vertical===undefined) {
                    moved = back.execMove(computemove.playerID, computemove.x, computemove.y);
                }else{
                    moved = back.execWall(computemove.playerID,computemove.x,computemove.y,computemove.vertical);
                }
                if (!moved) {
                    let move = back.execRandomMove(playerList[1].id);
                    await adaptator.correction(move);
                    console.log("correction : " + move);
                }else{
                    console.log("IA move")
                    console.log(computemove)
                }
            }
            aiBoard = back.BoardFor(playerList[1]);
            await adaptator.updateBoard(aiBoard,playerList[1].id);
            board = back.getBoard();
            turnNb = back.getTurnNb();
            saveGame(board, myId, turnNb, playerList, saveId);
            newBoard = back.BoardFor(playerList[0])
            socket.emit("updateBoard", newBoard,turnNb)
        }

        let winners = back.GameWinner();
        if (winners != null) {
            socket.emit("endGame", winners);
        }
    });
    socket.on("gameSetup",(move)=>{
        console.log("gameSetup")
        console.log(move)
        let me = null;
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }

        if(me.OnTile!=null) return;
        console.log("player not on Tile")
        let coords = {X:move.x,Y:move.y}
        if(me.start.find((e)=>e.X==coords.X&&e.Y==coords.Y) ==null )return;
        console.log("On Tile Found")
        playerList= back.getPlayerList(gameId);

        back.placePlayer(gameId,myId,coords);
    
        for(let player of playerList){
            if(player.OnTile==null) return;
        }
        console.log("finito")
        socket.emit("playersReady", gameId)
    })

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

let players = [];
let connectedPlayers = {}
io.of("/api/1vs1").on('connection', async (socket) => {
    let myId;
    let playerList;
    let board;
    let turnNb;
    let gameId;
    let saveId
    socket.on('sendInfo', async (playerid) => {
        myId = playerid;

        console.log("playerid: "+playerid)
        let alreadyIn = false;
        for(let i = 0; i < players.length; i++){
            if(players[i].id === playerid){
                players[i].socket.disconnect();
                players[i].socket = socket;
                alreadyIn = true;
            }
        }
        if(!alreadyIn){
            players.push({id: playerid, socket: socket});
        }
        if (players.length >= 2) {
            gameId = back.init();
            let playersForGame = []
            for(let i = 0; i < players.length; i++){
                players[i].socket.join('room'+gameId);
            }
            playersForGame.push(players.shift().id);
            playersForGame.push(players.shift().id);
            //TODO recup les players account
            {
                let res = []
                for(let playerId of playersForGame){
                    res.push(new back.PlayerAccount(playerId,"GNGNNGGNNGNGGNgngngnnggnnnnnngnnnn"));
                }
                playersForGame = res
            }
            playerList = back.setPlayers(gameId, playersForGame);
            playerList = back.getPlayerList(gameId);
            connectedPlayers[gameId] = playerList;
            board = back.getBoard(gameId);
            turnNb = back.getTurnNb(gameId);
            saveId = await saveGame(board, myId, turnNb, playerList);
            io.of("/api/1vs1").to('room'+gameId).emit("initChoosePos",gameId)
        }
    });
    socket.on('move', async (move) => {
        console.log('playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        playerList = back.getPlayerList(gameId);
        if(myId ===  playerList[turnNb%playerList.length].getid()) {
            
            let me = null;
            for(let i=0;i<playerList.length;i++){
                if(playerList[i].getid()==myId){
                    me = playerList[i];
                    continue;
                }
            }
            let actionDone = back.execMove(gameId, me, move.x, move.y);
            if (actionDone) {
                board = back.getBoard(gameId);
                await saveGame(board, myId, turnNb, playerList, saveId);
                io.of("/api/1vs1").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('wall', async (wall) => {
        console.log('playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        playerList = back.getPlayerList(gameId);
        if(myId === playerList[turnNb%playerList.length].getid()) {
            
            let me = null;
            playerList= back.getPlayerList(gameId);
            for(let i=0;i<playerList.length;i++){
                if(playerList[i].getid()==myId){
                    me = playerList[i];
                    continue;
                }
            }
            let actionDone = back.execWall(gameId, me, wall.x, wall.y, wall.vertical)
            if (actionDone) {
                board = back.getBoard(gameId);
                await saveGame(board, myId, turnNb, playerList, saveId);
                io.of("/api/1vs1").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('update', async () => {

        turnNb = back.getTurnNb(gameId);
        
        let me = null;
        playerList= back.getPlayerList(gameId);
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        let newBoard = back.BoardFor(gameId,me);
        socket.emit("updateBoard", newBoard,turnNb);
        let winners = back.GameWinner(gameId);
        if (winners != null && winners.length!=0) {
            socket.emit("endGame", winners);
        }
    });
    
    socket.on('gameSetup', async ( move) => {

        let me = null;
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        if(me.OnTile!=null) return;
        let coords = {X:move.x,Y:move.y}
        if(me.start.find((e)=>e.X==coords.X&&e.Y==coords.Y) ==null )return;
        playerList= back.getPlayerList(gameId);

        back.placePlayer(gameId,myId,coords);
    
        for(let player of playerList){
            if(player.OnTile==null) return;
        }
        io.of("/api/1vs1").to('room' + gameId).emit("playersReady", gameId);
        
        
    });
    socket.on('start',async ()=>{
        back.getTurnNb(gameId)
        back.getPlayerList(gameId);
        back.getBoard(gameId);
        let me = null;
        playerList= back.getPlayerList(gameId);
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }

        let newBoard = back.BoardFor(gameId,me)

        socket.emit("launch",newBoard, turnNb);
    })
    socket.on('askForInitPos', async (gameID) => {
        gameId=gameID;
        turnNb = back.getTurnNb(gameId);
        let me = null;
        playerList= back.getPlayerList(gameId);
        let playerListId = []
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
            }
            playerListId.push(playerList[i].getid())
        }
        socket.emit("choosePos", back.setUpBoard(gameId,me),playerListId,turnNb);
    });
    socket.on("disconnect",()=>{
        if(!connectedPlayers.hasOwnProperty(gameId))return;
        for (let i = 0; i < connectedPlayers[gameId].length; i++) {
            if (connectedPlayers[gameId][i].getid() === myId) {
                connectedPlayers[gameId].splice(i, 1);
                i--; 
            }
        }
        connectedPlayers[gameId].filter((e)=>e.getid() != myId )
        if(connectedPlayers[gameId].length==0){
            back.deleteGame(gameId);
        }
    })
    socket.on('message', (message,playerName) => {
        io.of("/api/1vs1").to('room' + gameId).emit("message", message,playerName);
    });
    socket.on("disconnect", () => {
        console.log("disconnected")
        //players = players.filter(player => player.socket !== socket);
    });
});

io.of("/api/friendChat").on('connection', async (socket) => {
    socket.on('join', async (nameUser, friendName) => {
        socket.join(nameUser + friendName);
        socket.join(friendName + nameUser);
    });
    socket.on('newMessage', async (nameUser, friendName) => {
        io.of("/api/friendChat").to(nameUser + friendName).emit('updateMessage');
    });
});





