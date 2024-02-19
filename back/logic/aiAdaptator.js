const ai = require("./Cocoridor.js")

class Action {
    /**
     *
     * @param {Number} playerID
     */
    constructor(playerID){
        this.playerID = playerID;
    }
    /**
     *
     * @returns {Boolean}
     */


}

class Move extends Action{
    /**
     *
     * @param {Number} playerID
     * @param {Number} x
     * @param {Number} y
     */
    constructor(playerID, x,y){
        super(playerID);
        this.x =x;
        this.y =y;


    }


}

class Wall extends Action{
    /**
     *

     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} vertical
     */
    constructor(playerID, x, y, vertical){
        super(playerID);
        this.x = x;
        this.y = y;
        this.vertical = vertical;

    }

}


class gameState {
    /**
     *
     * @param {int[][]} board
     * @param {} opponentWalls
     * @param {} opponentWalls
     */
    constructor(board, opponentWalls, ownWalls){
        this.board = board;
        this.opponentWalls = opponentWalls;
        this.ownWalls = ownWalls;
    }
}

class AIMove {
    /**
     *
     * @param {String} action
     * @param {String} value
     */
    constructor(action, value){
        this.action = action;
        this.value = value;
    }
}

/**
 *
 * @param {TileFront[][]} board
 * @param {Number} playerID
 * @returns {TileFront}
 */
function findAi(board , playerID){
    for (const line of board) {
        for (const tile of line) {
            if(tile.occupied.id === playerID){
                return tile;
            }
        }
    }
}



/**
 *
 * @param {Number} x abscisse
 * @param {Number} y ordonnée
 * @returns {TileFront} la tuile correspondante ou null.
 */
function getTile(x, y, board) {
    if(x==null || y==null)return null;
    if(x<0 || x>=boardLength || y<0 || y>=boardHeight) return null;
    return board[y][x];
}

function convertToGameState(board, playerID){
    

    let newBoard = [];
    let ownWalls = [];
    let opponentWalls = [];
    for (let i = 0; i < board[0].length; i++) {
        newBoard.push([]);
        for (let j = 0; j < board.length; j++) {
            newBoard[i].push(-1);
        }
    }
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if(board[i][j].occupied === false) {
                newBoard[j][i] = -1;
            }else if(board[i][j].occupied === true){
                newBoard[j][i] = 0;
            }else if(board[i][j].occupied.id === playerID){
                newBoard[j][i] = 1;
            }else if(board[i][j].occupied.id !== undefined) {
                newBoard[j][i] = 2;
            }else{
                console.error("unknown value");
            }
         
       

            let pos = (j + 1) * 10 + i + 1;
            
            

            if(board[i][j].BorderR.playerId === playerID){
                ownWalls.push([pos, 1]);
            }

            else if(board[i][j].BorderR.playerId !== null){
                opponentWalls.push([pos, 1]);
            } 
                
            if (board[i][j].BorderD.playerId === playerID) {
                ownWalls.push([pos, 0]);
            } 
            
            else if (board[i][j].BorderD.playerId !== null) {
                opponentWalls.push([pos, 0]);
            }
        }
    }
    return new gameState(newBoard, opponentWalls, ownWalls);
}

async function computeMove(board, playerID=2) {
    let gameState = convertToGameState(board, playerID);

    let nextMove = await ai.nextMove(gameState);

    if(nextMove.action === "move"){
        let pos = parseInt(nextMove.value);
        return new Move(playerID,Math.floor(pos/10)-1 , pos%10-1);
    }
    if(nextMove.action === "wall"){
        let pos = parseInt(nextMove.value[0]);

 
        return new Wall(playerID, Math.floor(pos/10)-1, pos%10-1, nextMove.value[1] === 1);
    }
    if(nextMove.action === "idle"){
        return new Move(playerID, 0, 0);
    }
}

async function updateBoard(board, playerID){
    let gameState = convertToGameState(board, playerID);
    return await ai.updateBoard(gameState);
}

async function correction(move){

    let pos = ((move.x()+1)*10 + move.y()+1).toString();
    let aiMove;
    if(move instanceof Wall){
        pos = (pos,(move.vertical ? 1 : 0));
        aiMove = new AIMove("wall", pos);
    } else if(move instanceof Move){
        aiMove = new AIMove("move", pos);
    }
    else{
        aiMove = new AIMove("idle", "");
    }
    return await ai.correction(aiMove);
}

async function setup(AIplay, playerID){
    let pos = await ai.setup(AIplay);
    let newPos = { X: Math.floor(pos/10)-1, Y: pos%10-1};
    return newPos;

}



exports.computeMove = computeMove;
exports.updateBoard = updateBoard;
exports.correction = correction;
exports.setup = setup;




