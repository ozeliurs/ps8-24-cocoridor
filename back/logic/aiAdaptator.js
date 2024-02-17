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

class Gamestate {
    /**
     *
     * @param {TileFront[][]} board
     * @param {Number} playerID
     */
    constructor(board, playerID){
        this.board = board;
        this.playerID = playerID;
    }
}
// This function doesn't handle walls.

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

function computeMove(board, playerID=2) {
    let gameState = [];
    for (let i = 0; i < board.length; i++) {
        convertBoard.push([]);
        for (let j = 0; j < board[i].length; j++) {

        }
    }
}

exports.computeMove = computeMove;




