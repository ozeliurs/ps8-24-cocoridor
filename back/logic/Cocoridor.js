// yourTeam.js


let PreviousGameState = null;
let EnnemyPos = null;
let startPos = null
let endPos = [];
let wallState = -1;
let ennemyEndPos = []
let worstEnnemyPos = null
let playerturn = null;

exports.setup = async function setup(AIplay) {
    PreviousGameState = null;
    EnnemyPos = null;
    startPos = null;
    endPos = [];
    wallState = -1;
    ennemyEndPos = []
    worstEnnemyPos = null
    playerturn = AIplay;
    if (AIplay === 2) {
        let random = Math.floor(Math.random() * 2);
        if (random === 0){
            startPos = 29;
        } else {
            startPos = 89;
        }
        for(let i=0;i<9;i++){
            endPos.push({x:i,y:0})
            ennemyEndPos.push({x:i,y:8})
        }
    } else {
        let random = Math.floor(Math.random() * 2);
        if (random === 0){
            startPos = 21;
        } else {
            startPos = 81;
        }

        for(let i=0;i<9;i++){
            endPos.push({x:i,y:8})
            ennemyEndPos.push({x:i,y:0})
        }
    }
    return Promise.resolve(startPos.toString());
};

exports.nextMove = async function nextMove(gamestate) {

    let currentPosition;
    for(let i = 0; i < gamestate.board.length; i++)if(currentPosition==null){
        for(let j = 0; j < gamestate.board[i].length; j++){
            if(gamestate.board[i][j] === 1){
                currentPosition = {y:j,x:i};
                break;
            }
        }
    }


    if(!(PreviousGameState !== null && PreviousGameState.opponentWalls.length!== gamestate.opponentWalls.length) ){
        
        if(findEnnemy(gamestate,currentPosition)==null && worstEnnemyPos!=null){
            let nextMove = aStar({gameState:gamestate,currentPosition : worstEnnemyPos, endPos : ennemyEndPos})
            while(nextMove.previous.previous!=null) nextMove = nextMove.previous;
            worstEnnemyPos = nextMove
            console.log("ennemy in : ",worstEnnemyPos)
            if(aStar({gameState:gamestate,currentPosition : worstEnnemyPos, endPos : ennemyEndPos, MaxCost:1})!=null){
                //go placer un mur en supposant l'ennemie sur worstEnnemyPos
                console.log("MUST PLACE A WALL OR THE DIYING")
            }
        }
    }


    PreviousGameState = gamestate;

    if(wallState == -1){
        wallState = 0;
        if (playerturn === 2){
            if (startPos === 39){
                return Promise.resolve({ action: "wall", value: ["63",0]});
            } else {
                return Promise.resolve({ action: "wall", value: ["33",0]});
            }
        } else {
            if (startPos === 31){
                return Promise.resolve({ action: "wall", value: ["68",0]});
            } else {
                return Promise.resolve({ action: "wall", value: ["38",0]});
            }
        }

    }
    //currentPosition is the position where you find a 1 in gamesState.board
    function aStarFor(me=true,additionnalWalls=[]){
        if(me) {
            return aStar({gameState:gamestate,currentPosition,endPos:endPos,addWalls:additionnalWalls})
        }
        else {
            if(EnnemyPos==null) return null;
            return aStar({gameState:gamestate,currentPosition: {x:EnnemyPos.x,y:EnnemyPos.y},endPos:ennemyEndPos,addWalls:additionnalWalls})
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
        let nextPosition = (path.node.x+1)*10+path.node.y+1;
        return Promise.resolve({ action: "move", value: nextPosition.toString() });

    }

    let currentPaths = calculatePaths();
    //Si je peux aller a la ligne d'arrivé
    if(currentPaths.Me.cost == 1){
        return followPath(currentPaths.Me)
    }

    //TODO on Test le placement de plusieurs murs
    let bestWall =null;
    if(EnnemyPos!=null && gamestate.ownWalls.length<10){
        let length = gamestate.board.length;
        let height = gamestate.board[0].length
        let bestScore = null;
        for(let vert of [0,1]) for(let x=0;x<length;x++) for(let y=0;y<height;y++){
            if(!canPlaceWall(gamestate,{x:x,y:y},vert)) continue;
            let testWall = calculatePaths([[(x+1)*10+y+1,vert]])
            if(testWall==null)continue;
            if(bestScore==null || bestScore>testWall.Score){
                bestWall = testWall;
                bestScore = testWall.Score;
            }
        }
    }
    //on compare un move avec le meilleur mur
    if(bestWall!=null && (currentPaths.Score-1>bestWall.Score ||(currentPaths.Opponent!=null&&currentPaths.Opponent.cost == 1))){ // si avancer d'une case rapporte moins que placer un mur
        //on place un mur
        let val = [bestWall.Action[0][0].toString(),bestWall.Action[0][1]]
        return Promise.resolve({ action: "wall", value: val });
    }else{
        //on se deplace
        return followPath(currentPaths.Me)
    }

    
    
}


exports.correction = async function correction(rightMove) {
    return Promise.resolve(true);
};

/**
 * 
 * @param {gameState} gamestate 
 * @returns 
 */
exports.updateBoard = async function updateBoard(gamestate) {
    let currentPosition;
    for(let i = 0; i < gamestate.board.length; i++)if(currentPosition==null){
        for(let j = 0; j < gamestate.board[i].length; j++){
            if(gamestate.board[i][j] === 1){
                currentPosition = {y:j,x:i};
                break;
            }
        }
    }
    findEnnemy(gamestate, currentPosition);
    PreviousGameState = gamestate;
    return Promise.resolve(true);
};

/**
 * 
 * @param {gamestate} gamestate 
 * @param {{x:Number,y:Number}} currentPos 
 * @returns 
 */
function findEnnemy(gamestate,currentPos) {
    /**
     * 
     * @param {Boolean} me
     * @param {[String,Number]} wall
     */
    function wallLight(me,wall){
        let pos = parseInt(wall[0])
        let x = Math.floor((pos-1)/10)
        let y = pos%10-1

        if(wall[1]==0) for(let modif of [[0,0],[-1,0],[0,1],[1,0],[0,-1],[-1,-1],[0,-2],[1,-1]]) {
            for(let pair of [[0,0],[1,0]]){
                let newX = x + modif[0] + pair[0] - 1
                let newY = y + modif[1] + pair[1]
                if(newX<0||boardLength<=newX||newY<0||boardHeight<=newY)continue;
                visibility[newX][newY]+=me?1:-1;
            }
        }
        else for(let modif of [[0,0],[0,1],[-1,0],[0,-1],[1,0],[1,1],[2,0],[1,-1]]){    
            
            for(let pair of [[0,0],[0,-1]]){
                let newX = x + modif[0] + pair[0] - 1
                let newY = y + modif[1] + pair[1]
                if(newX<0||boardLength<=newX||newY<0||boardHeight<=newY)continue;
                visibility[newX][newY]+=me?1:-1;
            }
        }
    }

    // Si je vois l'ennemi
    let res = null;
    for(let i = 0; i < gamestate.board.length; i++){

        for(let j = 0; j < gamestate.board[i].length; j++){
            if(gamestate.board[i][j] === 2){
                
                res = {x:i, y:j};//(i+1)*10+j+1;
                worstEnnemyPos = EnnemyPos = res;
                return res;
            }
        }
    }
    
    //Visi de base
    let visibility = []
    let boardLength = gamestate.board.length
    let boardHeight = gamestate.board[0].length
    for (let x=0;x<boardLength;x++){
        visibility.push([])
        for(let y=0;y<boardHeight;y++){
            if(y<(boardHeight-1)/2)visibility[x][y] = -1
            else if(y>(boardHeight)/2)visibility[x][y] = 1
            else visibility[x][y] = 0
        }
    }
    //Visi des murs
    for(let wall of gamestate.ownWalls) wallLight(true,wall)
    for(let wall of gamestate.opponentWalls) wallLight(false,wall)
    //Visi du joueur

    for(let modif of [[0,0],[0,1],[1,0],[-1,0],[0,-1]]) {
        let newX = currentPos.x+modif[0]
        let newY = currentPos.y+modif[1]
        if(newX<0||boardLength<=newX||newY<0||boardHeight<=newY)continue;
        visibility[newX][newY] +=1
    }

    let visionDifference = []
    //Detect differences
    for(let x=0;x<boardLength;x++) for(let y=0;y<boardHeight;y++) {
        if((gamestate.board[x][y]<0 && visibility[x][y]>=0)||(gamestate.board[x][y]>=0 && visibility[x][y]<0)) visionDifference.push([x,y])
    }
    let posPossible = []
    switch(visionDifference.length){
        case 1:
            for(let modif of [[0,0],[0,1],[1,0],[0,-1],[-1,0]])posPossible.push([visionDifference[0][0]+modif[0],visionDifference[0][1]+modif[1]])
        break;
        case 2:
            let tile1 = visionDifference[0]
            let tile2 = visionDifference[1]
            if(tile1[0] != tile2[0] && tile1[1] !=tile2[1]){//si les cases sont en diagonales
                posPossible.push([tile1[0],tile2[1]])
                posPossible.push([tile1[1],tile2[0]])
            }else if(Math.abs(tile1[0]-tile2[0])+Math.abs(tile1[1]-tile2[1])==2 && Math.abs(tile1[0]-tile2[0])!=1){
                if(tile1[0]==tile2[0]) posPossible.push([tile1[0],(tile1[1]+tile2[1])/2]);
                else posPossible.push([(tile1[0]+tile2[0])/2,tile1[1]]);
            }else if(Math.abs(tile1[0]-tile2[0])+Math.abs(tile1[1]-tile2[1]) == 1){
                posPossible = visionDifference
            }
        break;
        case 3:
        case 4:
        case 5:
            let sumX = 0
            let sumY = 0
            for(let tile of visionDifference){
                sumX += tile[0]
                sumY += tile[1]
            }
            posPossible = [Math.round(sumX/visionDifference.length) , Math.round(sumY/visionDifference.length)]
        break;
        default: 
            //on rajoute le meilleur deplacement possible du joueur adverse
            posPossible
        break;
    }


    //on enleve les cases qui ne sont pas dans le tableau
    posPossible = posPossible.filter((e)=>0<=e[0] && 0<=e[1] && e[0]<boardLength && e[1]<boardHeight)
    
    //on enleve les cases sur lesquelles on a la vision
    posPossible = posPossible.filter((e)=>gamestate.board[e[0]][e[1]]==-1)
    posPossible = posPossible.filter((e)=>gamestate.board[e[0]][e[1]]==-1)

    //on enleve les cases sur lequel le joueur n'a pas pu se deplacer avec le nombre de mouvement qu'il a effectue
    if(EnnemyPos!=null) posPossible = posPossible.filter((e)=> (Math.abs(e.x-EnnemyPos.x) + Math.abs(e.y-EnnemyPos.y))%2 == worstEnnemyPos%2)

    {
        let newPosPossible = []
        for(pos of posPossible){

            let tabCopy = [];

            for (let i = 0; i < visibility.length; i++)
                tabCopy[i] = visibility[i].slice();


            for(let modif of [[0,0],[0,1],[1,0],[-1,0],[0,-1]]) {
                let newX = pos[0]+modif[0]
                let newY = pos[1]+modif[1]
                if(newX<0||boardLength<=newX||newY<0||boardHeight<=newY)continue;
                tabCopy[newX][newY] -=1
            }
            let diffDetected = false
            for(let x=0;x<boardLength;x++) for(let y=0;y<boardHeight;y++) {
                if((gamestate.board[x][y]<0 && tabCopy[x][y]>=0)||(gamestate.board[x][y]>=0 && tabCopy[x][y]<0)) {
                    diffDetected = true;
                    break;
                }
                
            }
            if(!diffDetected) newPosPossible.push(pos)

        }
        posPossible = newPosPossible
    }
    console.log("case possibles:")
    console.log(posPossible)

    switch(posPossible.length){
        case 0:
            return null;
        case 1:
            return worstEnnemyPos = EnnemyPos = {x:posPossible[0][0],y:posPossible[0][1]}
        default:
        break;
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
                return worstEnnemyPos = EnnemyPos = {x:posPossible[0][0],y:posPossible[0][1]}
            }


        }

    
    }
    
    
    return null;

}

  /**
   * 
   * @param {{gameState:gameState,playerId:Number,MaxCost:Number,jumpWall:Boolean,addWalls:Border[]}} param0 
   * @returns {{node:{x:Number,y:Number},cost:Number,estimate:Number,previous: null} | null}
   */
  function aStar({gameState: gamestate, currentPosition, endPos, maxCost = null, addWalls = [],opponentBlock=false}= {}){
    let length = gamestate.board.length;
    let height = gamestate.board[0].length;
    let killTimer = length*height;
    let playerPos = currentPosition
    let ends = endPos
    function inGame(coords){
        return coords!=null && coords.x!=null && coords.y!=null && 0<=coords.x && 0<=coords.y && coords.x<length && coords.y<height
    }
    /**
     * 
     * @param {{x:Number,y:Number}} from 
     * @returns {{Coords:{x:Number,y:Number},Value:Number}} 
     */
    function nearestEnd(from){
        let nearestCoords = ends[0]
        let nearestVal = Math.abs(from.x-nearestCoords.x)+Math.abs(from.y-nearestCoords.y)
        for(let end of ends) {
            let dist = Math.abs(from.x-end.x)+Math.abs(from.y-end.y)
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

      let current = {x:coords.x,y:coords.y+1};
      if(inGame(current) ) {//tant que la case existe
        if(!wallAt(gamestate, current,false, addWalls) && !wallAt(gamestate, {x:current.x-1,y:current.y},false, addWalls)) { // si je peux me deplacer sur cette case
          result.push(current); // si il y a personne alors je renvois que cette tuile est ma voisine
        }
      }
      current = {x:coords.x+1,y:coords.y};
      if(inGame(current) ) {
        if(!wallAt(gamestate, {x:current.x-1,y:current.y},true, addWalls) && !wallAt(gamestate, {x:current.x-1,y:current.y+1},true, addWalls)) {
          result.push(current);
        }
      }
      current = {x:coords.x,y:coords.y-1};
      if(inGame(current) ) {
        if(!wallAt(gamestate, {x:current.x,y:current.y+1},false, addWalls) && !wallAt(gamestate, {x:current.x-1,y:current.y+1},false, addWalls)) {
          result.push(current);
        }
      }
      current = {x:coords.x-1,y:coords.y};
      if(inGame(current) ) {
        if(!wallAt(gamestate, current,true, addWalls) && !wallAt(gamestate, {x:current.x,y:current.y+1},true, addWalls)) {
          result.push(current);
        }
      }
      return result;
    }
  
    let explored= [];
  
    let frontier =[]



    for(let modif of [{x:0,y:1,wall:{x:0,y:0}},{x:1,y:0,wall:{x:-1,y:0}},{x:0,y:-1,wall:{x:0,y:1}},{x:-1,y:0,wall:{x:0,y:0}}]){
        let current = playerPos;
        do{
            current = {x:(current.x+modif.x),y:(current.y+modif.y)}
            if(!inGame(current) || wallAt(gamestate, {x:current.x+modif.wall.x,y:current.y+modif.wall.y},modif.y!=0?0:1, addWalls)|| wallAt(gamestate, {x:current.x+modif.wall.x+(modif.y!=0?-1:0),y:current.y+modif.wall.y+(modif.x!=0?1:0)},modif.y!=0?0:1, addWalls)){
                current=null;
                break;
            }
        }while(inGame(current) && opponentBlock && gamestate.board[current.x][current.y]!=0 && gamestate.board[current.x][current.y]!=-1)
        if(inGame(current)) frontier.push({
            node : current,
            cost : 1,
            estimate : nearestEnd(current),
            previous : null
        })
    }
  
  
    while(frontier.length>0){
      if(killTimer--<=0){
        return null;}
  
      
        frontier.sort((a,b)=>{
            let diff = (a.estimate.Value+a.cost)-(b.estimate.Value+b.cost);
            if(diff!=0)return diff;
            else return Math.random() > 0.5 ? 1 : -1
        });
  
      let currentBest = frontier.shift();
      if(currentBest.estimate.Value == 0) {
        if(maxCost!=null && maxCost<currentBest.cost){
          return null;
        } 
        else {
          return currentBest;
        }
      }
  
      explored.push(currentBest)
      for(let step of getNeighbour(currentBest.node,addWalls)){
        let isExplored = (explored.find( e => {
            return e.node.x == step.x 
            &&  e.node.y == step.y
            &&  e.cost<=currentBest.cost+1;
        }))
  
        let isFrontier = (frontier.find( e => {
            return e.node.x == step.x 
            &&  e.node.y == step.y
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
    return null;
  }

  /**
   * 
   * @param {gamestate} gamestate 
   * @param {{x:Number,y:Number}} coords 
   * @param {Boolean} vertical 
   * @returns {Boolean}
   */
  function wallAt(gamestate , coords, vertical,additionnalWalls = []){
    let allWalls = [...gamestate.opponentWalls, ...gamestate.ownWalls, ...additionnalWalls]
    for(let wall of allWalls){
        if(wall[0] == (coords.x+1)*10+coords.y+1 && wall[1]==vertical?1:0) return true;
    }
    
    return false;
  }
  
  function canPlaceWall(gamestate, coords,vertical){
    if(vertical) return !(wallAt(gamestate, {x:coords.x,y:coords.y+1},true)
        || wallAt(gamestate, {x:coords.x,y:coords.y},false)
        || wallAt(gamestate, {x:coords.x,y:coords.y},true)
        || wallAt(gamestate, {x:coords.x,y:coords.y-1},true))

    else return !(wallAt(gamestate, {x:coords.x-1,y:coords.y},false)
        || wallAt(gamestate, {x:coords.x,y:coords.y},false)
        || wallAt(gamestate, {x:coords.x,y:coords.y},true)
        || wallAt(gamestate, {x:coords.x+1,y:coords.y},false))
  }