// yourTeam.js


let PreviousGameState = null;
let EnnemyPos = null;
let startPos = null
let endPos = []
let wallState = -1;

exports.setup = async function setup(AIplay) {
    PreviousGameState = null;
    EnnemyPos = null;
    startPos = null
    endPos = []
    wallState = -1;
    if (AIplay === 2) {
        startPos = 99
        for(let i=0;i<9;i++)endPos.push({X:i,Y:0})
    } else {
        startPos = 11
        for(let i=0;i<9;i++)endPos.push({X:i,Y:8})
    }
    return Promise.resolve(startPos.toString());
};

exports.nextMove = async function nextMove(gameState) {
    adaptGameStateWalls(gameState);
    console.log(gameState)

    findEnnemy(gameState);
    //currentPosition is the position where you find a 1 in gamesState.board
    let currentPosition;
    let path
    for(let i = 0; i < gameState.board.length; i++)if(currentPosition==null){
        for(let j = 0; j < gameState.board[i].length; j++){
            if(gameState.board[i][j] === 1){
                currentPosition = (i+1)*10+j+1;
                path = aStar({gameState:gameState,currentPosition:{Y:j,X:i}})
                break;
            }
        }
    }
    while(path.previous!=null){path = path.previous}
    let nextPosition = (path.node.X+1)*10+path.node.Y+1;
    //let wallAtNextPosition = gameState.opponentWalls.find(wall => wall[0] === currentPosition && wall[1] === 0);
    PreviousGameState = gameState;
    /*if (!wallAtNextPosition && nextPosition >= 1) {
        
        return Promise.resolve({ action: "move", value: nextPosition.toString() });
    } else {

        return Promise.resolve({ action: "wall", value: ["54",1]});
    }*/
    if(wallState == -1){
        wallState = 0;
        //return Promise.resolve({ action: "move", value: (currentPosition-2).toString() });
        return Promise.resolve({ action: "wall", value: ["33",0]});
    }
    return Promise.resolve({ action: "move", value: nextPosition.toString() });
    
};


exports.correction = async function correction(rightMove) {

    return Promise.resolve(true);
};


exports.updateBoard = async function updateBoard(gameState) {
    adaptGameStateWalls(gameState);
    findEnnemy(gameState);
    PreviousGameState = gameState;
    return Promise.resolve(true);
};


function findEnnemy(gamestate) {

    if(PreviousGameState === null){
        return;
    }

    if(PreviousGameState.opponentWalls.length!== gamestate.opponentWalls.length ){
       // console.log("opponnents walls old : " + PreviousGameState.opponentWalls + "new : "+ gamestate.opponentWalls);

        return;

    }



    let res = null;
    for(let i = 0; i < gamestate.board.length; i++){

        for(let j = 0; j < gamestate.board[i].length; j++){
            if(gamestate.board[i][j] === 2){
                
                res = {x:i, y:j};//(i+1)*10+j+1;
                console.log("ennemy : " + res.x + " " + res.y);
                EnnemyPos = res;
                return res;
            }
        }
    }

    if (res === null) {
        if(EnnemyPos !== null){
            //verifier les 4 cases autour de EnnemyPos
            let possiblepos = [];
            if(EnnemyPos.x>0){

                possiblepos.push({x:EnnemyPos.x-1, y:EnnemyPos.y});

            }
            if(EnnemyPos.x<gamestate.board.length-1){
                possiblepos.push({x:EnnemyPos.x+1, y:EnnemyPos.y});
            }
            if(EnnemyPos.y>0){
                possiblepos.push({x:EnnemyPos.x, y:EnnemyPos.y-1});
            }
            if(EnnemyPos.y<gamestate.board[0].length-1){
                possiblepos.push({x:EnnemyPos.x, y:EnnemyPos.y+1});
            }

            //si on a gagné la vision a droite, il n'est pas allé a droite ect ...

            for (i in ( possiblepos.length-1)){
                if(gameState.board[pos.x][pos.y] === 0 ){
                    possiblepos.splice(i, 1);
                }

            }
            if(possiblepos.length === 1){
                res = possiblepos[0];
                EnnemyPos = res;
                return res;
            }


        }

    
    }
    
    EnnemyPos = res;
    return res;

}

  /**
   * 
   * @param {{gameState:gameState,playerId:Number,MaxCost:Number,jumpWall:Boolean,addWalls:Border[]}} param0 
   * @returns {{node:{X:Number,Y:Number},cost:Number,estimate:Number,previous: null} | null}
   */
  function aStar({gameState, currentPosition, maxCost = null, addWalls = [],opponentBlock=false}= {}){
    let length = gameState.board.length;
    let height = gameState.board[0].length;
    let killTimer = length*height;
    let playerPos = currentPosition
    let ends = endPos
    let allWalls =  [...gameState.ownWalls,...gameState.opponentWalls,...addWalls]
    function inGame(coords){
        return coords!=null && coords.X!=null && coords.Y!=null && 0<=coords.X && 0<=coords.Y && coords.X<length && coords.Y<height
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
    
    function wallAt(from,vertical){
    let element = allWalls.find((e)=>{
        return e[0] == ((from.X+1)*10)+ from.Y+1 && e[1] == vertical?1:0
    })
    return element!=undefined;
    }
    /**
     * 
     * @returns {Tile[]}
     */
    function getNeighbour(coords){
      let result = [];

      let current = {X:coords.X,Y:coords.Y+1};
      if(inGame(current) ) {//tant que la case existe
        if(!wallAt(current,false)) { // si je peux me deplacer sur cette case
          result.push(current); // si il y a personne alors je renvois que cette tuile est ma voisine
        }
      }
      current = {X:coords.X+1,Y:coords.Y};
      if(inGame(current) ) {
        if(!wallAt({X:current.X-1,Y:current.Y},true)) {
          result.push(current);
        }
      }
      current = {X:coords.X,Y:coords.Y-1};
      if(inGame(current) ) {
        if(!wallAt({X:current.X,Y:current.Y+1},false)) {
          result.push(current);
        }
      }
      current = {X:coords.X-1,Y:coords.Y};
      if(inGame(current) ) {
        if(!wallAt(current,true)) {
          result.push(current);
        }
      }
      return result;
    }
  
    let explored= [];
  
    let frontier =[]
    for(let modif of [{X:0,Y:1,wall:{X:0,Y:0}},{X:1,Y:0,wall:{X:-1,Y:0}},{X:0,Y:-1,wall:{X:0,Y:1}},{X:-1,Y:0,wall:{X:0,Y:0}}]){
        let current = playerPos;
        do{
            current = {X:(current.X+modif.X),Y:(current.Y+modif.Y)}
            if(!inGame(current) || wallAt({X:current.X+modif.wall.X,Y:current.Y+modif.wall.Y},modif.Y!=0?0:1)){
                current=null;
                break;
            }
        }while(inGame(current) && opponentBlock && gameState.board[current.X][current.Y]!=0 && gameState.board[current.X][current.Y]!=-1)
        if(inGame(current)) frontier.push({
            node : current,
            cost : 1,
            estimate : nearestEnd(current),
            previous : null
        })
    }
  
  
    while(frontier.length>0){
      if(killTimer--<=0){
      console.log("aStar overload")
        return null;}
  
      
        frontier.sort((a,b)=>{
            let diff = (a.estimate.Value+a.cost)-(b.estimate.Value+b.cost);
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
      for(let step of getNeighbour(currentBest.node,addWalls)){
        let isExplored = (explored.find( e => {
            return e.node.X == step.X 
            &&  e.node.Y == step.Y
            &&  e.cost<=currentBest.cost+1;
        }))
  
        let isFrontier = (frontier.find( e => {
            return e.node.X == step.X 
            &&  e.node.Y == step.Y
            &&  e.cost<=currentBest.cost+1;
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

  function adaptGameStateWalls(gameState){
    let ownWalls =gameState.ownWalls;
    let opponentWalls=gameState.opponentWalls;

    let WallsToAdd=[]
    for(let wall of ownWalls){
      WallsToAdd.push([wall[0]+(wall[1]==1?1:10),wall[1]])
    }
    gameState.ownWalls = gameState.ownWalls.concat(WallsToAdd);

    WallsToAdd=[]
    for(let wall of opponentWalls){
      WallsToAdd.push([wall[0]+(wall[1]==1?1:10),wall[1]])
    }
    gameState.opponentWalls = gameState.opponentWalls.concat(WallsToAdd);
  }