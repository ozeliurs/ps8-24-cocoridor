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
                console.log("Error");
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

    let path = aStar({gameState:gameState,playerId:playerID})//TODO : erase up to...
    console.log("path:")
    console.log(path)
    console.log("aStar (from finish to start):")
    while(path!=null){
        console.log(path.node)
        path = path.previous
    } 
    console.log("update")//  ... here

    let nextMove = await ai.nextMove(gameState);
    console.log("nextMove: "+nextMove.value);
    if(nextMove.action === "move"){
        let pos = parseInt(nextMove.value);
        return new Move(playerID,Math.floor(pos/10)-1 , pos%10-1);
    }
    if(nextMove.action === "wall"){
        let pos = parseInt(nextMove.value[0]);

        console.log(nextMove.value[1]);
        console.log("pos : " + pos);
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
    let newPos = { X: Math.floor(pos/10)-1, Y: pos%10-1};
    return newPos;

}


  /**
   * 
   * @param {{gameState:gameState,playerId:Number,MaxCost:Number,jumpWall:Boolean,addWalls:Border[]}} param0 
   * @returns {{node:{X:Number,Y:Number},cost:Number,estimate:Number,previous: null} | null}
   */
  function aStar({gameState,playerId , maxCost = null, opponentBlock = false, jumpWall = false, addWalls = []}= {}){
    let length = gameState.board.length;
    let height = gameState.board[0].length;
    let killTimer = length*height;
    let playerPos = {}
    let ends = []
    for(let x=0;x<length;x++) ends.push({X:x, Y:(playerId==1?height-1:0)});
    
    for(let y=0;y<height;y++) for(let x=0;x<length;x++){
        if(gameState.board[y,x]==1){
            playerPos = {X:x,Y:y};
            break;
        }
    }

    /**
     * 
     * @param {{X:Number,Y:Number}} from 
     * @returns {{Coords:{X:Number,Y:Number},Value:Number}} 
     */
    function nearestEnd(from){
        let nearestCoords = ends[0]
        let nearestVal = Math.abs(from.X-nearestCoords.X)+Math.abs(from.Y-nearestCoords.Y)
        for(let end of ends) {
            let dist = Math.abs(from.X-end.X)+Math.abs(from.Y-end.Y)
            if(dist < nearestVal){
                nearestCoords = end
                nearestVal = dist
            }
        }
        return {Coords:nearestCoords,Value:nearestVal};
    }
    /**
     * 
     * @returns {Tile[]}
     */
    function getNeighbour( opponentBlock=false, jumpWalls=false, fictionnalWalls = []){
      let result = [];
      let allWalls =  []
      allWalls.push(gameState.ownWalls)
      allWalls.push(gameState.opponentWalls)
      current = {X:playerPos.X,Y:playerPos.Y};
      function wallAt(coords,vertical){
        return allWalls.find((e)=>e[0] == ((coords.X+1)*10)+ coords.Y+1 && e[1] == vertical?1:2)
      }
      console.log(current)
      while(current!=null ) {//tant que la case existe
        if(jumpWalls || !wallAt({X:current.X,Y:current.Y+1},false) || !fictionnalWalls.wallAt(current)) { // si je peux me deplacer sur cette case
          if(opponentBlock&&current.occupied!=null) current = {X:current.X,Y:current.Y+1} // si il y a qqn alors je passe a la case d'apres
          else {result.push(current);break;} // si il y a personne alors je renvois que cette tuile est ma voisine
        }else break; // si je peux pas me deplacer dessus alors je ne la renvoie pas
      }
      current = {X:playerPos.X+1,Y:playerPos.Y};
      while(current!=null ) {
        if(jumpWalls || !wallAt(current,true) || !fictionnalWalls.includes(current.BorderR)) {
          if(opponentBlock&&current.occupied!=null) current = {X:current.X+1,Y:current.Y}
          else {result.push(current);break;}
        }else break;
      }
      current = {X:playerPos.X,Y:playerPos.Y-1};
      while(current!=null ) {
        if(jumpWalls || !wallAt(current,false) || !fictionnalWalls.includes(current.BorderR)) {
          if(opponentBlock&&current.occupied!=null) current = {X:current.X,Y:current.Y-1}
          else {result.push(current);break;}
        }else break;
      }
      current = {X:playerPos.X-1,Y:playerPos.Y};
      while(current!=null ) {
        if(jumpWalls || !wallAt({X:current.X-1,Y:current.Y},true) || !fictionnalWalls.includes(current.BorderR)) {
          if(opponentBlock&&current.occupied!=null) current = {X:current.X-1,Y:current.Y}
          else {result.push(current);break;}
        }else break;
      }
      
      return result;
    }
  
    let explored= [];
  
    let frontier =[{
      node : playerPos,
      cost : 0,
      estimate : nearestEnd(playerPos),
      previous : null
    }]
  
  
    while(frontier.length>0){
      if(killTimer--<=0){
      
        return null;}
  
      
        frontier.sort((a,b)=>{
            let diff = a.estimate.Value-b.estimate.Value;
            if(diff!=0)return diff;
            else return Math.random() > 0.5 ? 1 : -1
        });
  
      let currentBest = frontier.shift();
      if(currentBest.estimate.Value == 0) {
        if(maxCost!=null && maxCost<currentBest.cost){
          console.log("tooExpensive")
          return null;
        } 
        else {
          return currentBest;
        }
      }
  
      explored.push(currentBest)
      console.log("neighbourToAdd : ")
      for(let step of getNeighbour(opponentBlock,jumpWall,addWalls)){
        console.log(step)
        let isExplored = (explored.find( e => {
            return e.node.X == step.X 
            &&  e.node.Y == step.Y
            &&  e.cost>currentBest.cost+1;
        }))
  
        let isFrontier = (frontier.find( e => {
            return e.node.X == step.X 
            &&  e.node.Y == step.Y
            &&  e.cost>currentBest.cost+1;
        }))
  
        if (!isExplored && !isFrontier) {
          frontier.push({
            node: step,
            cost: currentBest.cost+1,
            estimate: nearestEnd(step),
            previous : currentBest
          });
        }
      }
    }
    console.log("impossible to reach")
    return null;
  }

  
exports.computeMove = computeMove;
exports.updateBoard = updateBoard;
exports.correction = correction;
exports.setup = setup;




