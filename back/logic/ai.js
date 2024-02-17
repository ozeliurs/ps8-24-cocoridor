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
    let ai = findAi(board, playerID);
    let hauteur = board.length;
    let largeur = board[0].length;
    let possibleMoves = [];

    // Check if moving left is possible.
    if (ai.X > 0) possibleMoves.push({x: ai.X-1, y: ai.Y});
    // Check if moving right is possible.
    if (ai.X <largeur-1) possibleMoves.push({x: ai.X+1, y: ai.Y});
    // Check if moving down is possible.
    if (ai.Y > 0) possibleMoves.push({x: ai.X, y: ai.Y-1});
    // Check if moving up is possible.
    if (ai.Y < hauteur-1) possibleMoves.push({x: ai.X, y: ai.Y+1});

    let moveIndex = Math.floor(Math.random()*possibleMoves.length);
    movepos =  possibleMoves[moveIndex];
    return new Move (playerID, movepos.x, movepos.y);

   
 
}

function setUp(playerId, positions){
  let pos = positions[Math.floor(Math.random()*positions.length)]

  return pos
}

exports.computeMove = computeMove;
exports.setUp = setUp;




/*
function computeMove(gameState) {
    let pos = gameState.player.position;
    let possibleMoves = [];
    // Check if moving left is possible.
    if (pos > 20) possibleMoves.push(pos-10);
    // Check if moving right is possible.
    if (pos < 90) possibleMoves.push(pos+10);
    // Check if moving down is possible.
    if (pos % 10 !== 1) possibleMoves.push(pos-1);
    // Check if moving up is possible.
    if (pos % 10 !== 9) possibleMoves.push(pos+1);

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random()*possibleMoves.length);
    return possibleMoves[moveIndex];
    */