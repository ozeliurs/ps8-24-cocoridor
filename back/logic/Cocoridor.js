// yourTeam.js


let PreviousGameState = null;
let EnnemyPos = null;
let startPos = null
let endPos = []
let wallState = -1;
let ennemyEndPos = []

exports.setup = async function setup(AIplay) {
    PreviousGameState = null;
    EnnemyPos = null;
    startPos = null
    endPos = []
    wallState = -1;
    ennemyEndPos = []
    if (AIplay === 2) {
        startPos = 99
        for(let i=0;i<9;i++){
            endPos.push({X:i,Y:0})
            ennemyEndPos.push({X:i,Y:8})
        }
    } else {
        startPos = 11
        for(let i=0;i<9;i++){
            endPos.push({X:i,Y:8})
            ennemyEndPos.push({X:i,Y:0})
        }
    }
    return Promise.resolve(startPos.toString());
};

exports.nextMove = async function nextMove(gamestate) {

    findEnnemy(gamestate);
    PreviousGameState = gamestate;

    if(wallState == -1){
        wallState = 0;
        //return Promise.resolve({ action: "move", value: (currentPosition-2).toString() });
        return Promise.resolve({ action: "wall", value: ["33",0]});
    }
    //currentPosition is the position where you find a 1 in gamesState.board
    let currentPosition;
    for(let i = 0; i < gamestate.board.length; i++)if(currentPosition==null){
        for(let j = 0; j < gamestate.board[i].length; j++){
            if(gamestate.board[i][j] === 1){
                currentPosition = {Y:j,X:i};
                break;
            }
        }
    }
    function aStarFor(me=true,additionnalWalls=[]){
        if(me) return aStar({gameState:gamestate,currentPosition,endPos:endPos,addWalls:additionnalWalls})
        else {
            if(EnnemyPos==null) return null;
            return aStar({gameState:gamestate,currentPosition: {X:EnnemyPos.x,Y:EnnemyPos.y},endPos:ennemyEndPos,addWalls:additionnalWalls})
        }
    }

    function calculatePaths(additionnalWalls=[]){
        let myPath = aStarFor(true,additionnalWalls);
        if(myPath==null){return null;}
        if(EnnemyPos==null) return {Score:myPath.cost,Me:myPath,Opponent:null,Action:additionnalWalls}
        let ennemyPath = aStarFor(false,additionnalWalls);
        if(ennemyPath==null){return null;}
        return {Score:myPath.cost-ennemyPath.cost,Me:myPath,Opponent:ennemyPath,Action:additionnalWalls}
    }

    function followPath(path){
        while(path.previous!=null){path = path.previous}
        let nextPosition = (path.node.X+1)*10+path.node.Y+1;
        return Promise.resolve({ action: "move", value: nextPosition.toString() });

    }

    let currentPaths = calculatePaths();
    //Si je peux aller a la ligne d'arrivé
    if(currentPaths.Me.cost == 1){
        console.log("!je peux gagner!")
        return followPath(currentPaths.Me)
    }

    //TODO on Test le placement de plusieurs murs
    let bestWall =null;
    console.log(gamestate.ownWalls)
    if(EnnemyPos!=null && gamestate.ownWalls.length<10){
        let length = gamestate.board.length;
        let height = gamestate.board[0].length
        let bestScore = null;
        for(let vert of [0,1]) for(let x=0;x<length;x++) for(let y=0;y<height;y++){
            if(!canPlaceWall(gamestate,{X:x,Y:y},vert)) continue;
            let testWall = calculatePaths([[(x+1)*10+y+1,vert]])
            if(testWall==null)continue;
            if(bestScore==null || bestScore>testWall.Score){
                console.log("new LowScore: ",testWall.Action)
                console.log("scores: ",testWall.Me.cost," ",testWall.Opponent.cost)
                console.log("MyPath:")
                let log = testWall.Me
                while(log!=null){console.log("- ",log.node);log=log.previous}
                console.log("OpponentPath:")
                log = testWall.Opponent
                while(log!=null){console.log("- ",log.node);log=log.previous}
                bestWall = testWall;
                bestScore = testWall.Score;
            }
        }
    }
    //on compare un move avec le meilleur mur
    if((bestWall!=null && currentPaths.Score-1>bestWall.Score )||(currentPaths.Opponent!=null&&currentPaths.Opponent.cost == 1)){ // si avancer d'une case rapporte moins que placer un mur
        //on place un mur
        console.log("placeWall")
        console.log(bestWall.Action)
        return Promise.resolve({ action: "wall", value: bestWall.Action[0] });
    }else{
        //on se deplace
        console.log("move")
        return followPath(currentPaths.Me)
    }

    
    
}


exports.correction = async function correction(rightMove) {
    console.log("correction")
    return Promise.resolve(true);
};


exports.updateBoard = async function updateBoard(gameState) {
    findEnnemy(gameState);
    PreviousGameState = gameState;
    return Promise.resolve(true);
};


function findEnnemy(gamestate) {


    if(PreviousGameState !== null && PreviousGameState.opponentWalls.length!== gamestate.opponentWalls.length ){
        console.log("opponnents walls old : " + PreviousGameState.opponentWalls + "new : "+ gamestate.opponentWalls);

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
                if(gamestate.board[pos.x][pos.y] === 0 ){
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
  function aStar({gameState: gamestate, currentPosition, endPos, maxCost = null, addWalls = [],opponentBlock=false}= {}){
    let length = gamestate.board.length;
    let height = gamestate.board[0].length;
    let killTimer = length*height;
    let playerPos = currentPosition
    let ends = endPos
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
    /**
     * 
     * @returns {Tile[]}
     */
    function getNeighbour(coords){
      let result = [];

      let current = {X:coords.X,Y:coords.Y+1};
      if(inGame(current) ) {//tant que la case existe
        if(!wallAt(gamestate, current,false, addWalls) && !wallAt(gamestate, {X:current.X-1,Y:current.Y},false, addWalls)) { // si je peux me deplacer sur cette case
          result.push(current); // si il y a personne alors je renvois que cette tuile est ma voisine
        }
      }
      current = {X:coords.X+1,Y:coords.Y};
      if(inGame(current) ) {
        if(!wallAt(gamestate, {X:current.X-1,Y:current.Y},true, addWalls) && !wallAt(gamestate, {X:current.X-1,Y:current.Y+1},true, addWalls)) {
          result.push(current);
        }
      }
      current = {X:coords.X,Y:coords.Y-1};
      if(inGame(current) ) {
        if(!wallAt(gamestate, {X:current.X,Y:current.Y+1},false, addWalls) && !wallAt(gamestate, {X:current.X-1,Y:current.Y+1},false, addWalls)) {
          result.push(current);
        }
      }
      current = {X:coords.X-1,Y:coords.Y};
      if(inGame(current) ) {
        if(!wallAt(gamestate, current,true, addWalls) && !wallAt(gamestate, {X:current.X,Y:current.Y+1},true, addWalls)) {
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
            if(!inGame(current) || wallAt(gamestate, {X:current.X+modif.wall.X,Y:current.Y+modif.wall.Y},modif.Y!=0?0:1, addWalls)|| wallAt(gamestate, {X:current.X+modif.wall.X+(modif.Y!=0?-1:0),Y:current.Y+modif.wall.Y+(modif.X!=0?1:0)},modif.Y!=0?0:1, addWalls)){
                current=null;
                break;
            }
        }while(inGame(current) && opponentBlock && gamestate.board[current.X][current.Y]!=0 && gamestate.board[current.X][current.Y]!=-1)
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
      WallsToAdd.push([wall[0]+(wall[1]==1?-1:10),wall[1]])
    }
    gameState.ownWalls = gameState.ownWalls.concat(WallsToAdd);

    WallsToAdd=[]
    for(let wall of opponentWalls){
      WallsToAdd.push([wall[0]+(wall[1]==1?-1:10),wall[1]])
    }
    gameState.opponentWalls = gameState.opponentWalls.concat(WallsToAdd);
  }

  /**
   * 
   * @param {gamestate} gamestate 
   * @param {{X:Number,Y:Number}} coords 
   * @param {Boolean} vertical 
   * @returns {Boolean}
   */
  function wallAt(gamestate , coords, vertical,additionnalWalls = []){
    let allWalls = [...gamestate.opponentWalls, ...gamestate.ownWalls, ...additionnalWalls]
    for(let wall of allWalls){
        if(wall[0] == (coords.X+1)*10+coords.Y+1 && wall[1]==vertical?1:0) return true;
    }
    
    return false;
  }
  function canPlaceWall(gamestate, coords,vertical){
    if(vertical) return !(wallAt(gamestate, {X:coords.X,Y:coords.Y+1},true)
        || wallAt(gamestate, {X:coords.X,Y:coords.Y},false)
        || wallAt(gamestate, {X:coords.X,Y:coords.Y},true)
        || wallAt(gamestate, {X:coords.X,Y:coords.Y-1},true))

    else return !(wallAt(gamestate, {X:coords.X-1,Y:coords.Y},false)
        || wallAt(gamestate, {X:coords.X,Y:coords.Y},false)
        || wallAt(gamestate, {X:coords.X,Y:coords.Y},true)
        || wallAt(gamestate, {X:coords.X+1,Y:coords.Y},false))
  }