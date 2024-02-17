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
     * @param {Player} player
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
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if(board[i][j].occupied === false) {
                newBoard[i][j] = -1;
            }else if(board[i][j].occupied === false){
                newBoard[i][j] = 0;
            }else if(board[i][j].occupied.id === playerID){
                newBoard[i][j] = 1;
            }else if(board[i][j].occupied.id !== undefined) {
                newBoard[i][j] = 2;
            }else{
                console.log("Error");
            }
            if(board[i][j].BorderR.wallBy !== undefined){
                let pos = (i+1)*10+j+1;
                if(board[i][j].BorderR.wallBy.id === playerID){
                    ownWalls.push([pos, 1]);
                }else if(board[i][j].BorderR.wallBy.id !== undefined){
                    opponentWalls.push([pos, 1]);
                }
            }
            if(board[i][j].BorderD.wallBy !== undefined) {
                let pos = (i + 1) * 10 + j + 1;
                if (board[i][j].BorderB.wallBy.id === playerID) {
                    ownWalls.push([pos, 0]);
                } else if (board[i][j].BorderB.wallBy.id !== undefined) {
                    opponentWalls.push([pos, 0]);
                }
            }
        }
    }
    return new gameState(newBoard, ownWalls, opponentWalls);
}

async function computeMove(board, playerID=2) {
    let gameState = convertToGameState(board, playerID);
    let nextMove = await ai.nextMove(gameState);
    console.log("nextMove: "+ nextMove);
    if(nextMove.action === "move"){
        return new Move(playerID, nextMove.value.charCodeAt(0)-96, nextMove.value.charCodeAt(1)-48);
    }
    if(nextMove.action === "wall"){
        return new Wall(playerID, nextMove.value[0].charCodeAt(0)-96, nextMove.value[0].charCodeAt(1)-48, nextMove.value[1]===1);
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
    //todo on back
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
    return new Move(playerID, pos.charCodeAt(0)-96, pos.charCodeAt(1)-48);

}

exports.computeMove = computeMove;
exports.updateBoard = updateBoard;
exports.correction = correction;
exports.setup = setup;




