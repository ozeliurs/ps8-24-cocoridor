const apiQuery = require("../queryManagers/api")
const profile = require("./profile")
class GameParams{
  /**
   * 
   * @param {{numActions : Number,travelDist : Number,SightDistance : Number,lineOfSight : boolean,wallLength:Number,jumpOverWall:boolean,nbWallsPerPlayer:Number,absoluteSight:boolean,sightForce:Number,fog:boolean,lng:Number,lat:Number,nbTurn:Number,playerList:PlayerGameInstance[]}} param0 
   */
  constructor( {
    numActions = 1, //number of action per turn
    travelDist = 1, //number of tiles a player can travel in one action
    SightDistance = 1, //number of tiles the player has visibility around him
    lineOfSight = false, // po implemente
    wallLength = 2, // length of the wall built
    jumpOverWall = false, // if players can jump above walls by jumping on another player
    nbWallsPerPlayer = 10, //number max of wall a player can place
    absoluteSight = false,
    sightForce = 1,
    fog = true,
    lng = 9, 
    lat = 9,
    playerList = []}={}){
    
  this.numActions = numActions!=null?numActions:1 //number of action per turn
  this.travelDist = travelDist!=null?travelDist:1 //number of tiles a player can travel in one action
  this.SightDistance = SightDistance!=null?SightDistance:1 //number of tiles the player has visibility around him
  this.lineOfSight = lineOfSight!=null?lineOfSight:false // po implemente
  this.wallLength = wallLength!=null?wallLength:2 // length of the wall built
  this.jumpOverWall = jumpOverWall!=null?jumpOverWall:false// if players can jump above walls by jumping on another player
  this.nbWallsPerPlayer = nbWallsPerPlayer!=null?nbWallsPerPlayer:10 //number max of wall a player can place
  this.absoluteSight = absoluteSight!=null?absoluteSight:false
  this.sightForce = sightForce!=null?sightForce:1
  this.fog = fog!=null?fog:true
  this.boardLength = lng!=null?lng:9
  this.boardHeight = lat!=null?lat:9
  this.playerList = playerList!=null?playerList:[]
  }
}
class GameState{
  static onGoing = {}

  /**
   *
   * @param {GameState} gameState
   * @returns
   */
  static async loadGame(gameState) {
    if (GameState.onGoing[gameState.id] == null) {
      let newGameState = new GameState(null, false);
      newGameState.gameParams = new GameParams(gameState.gameParams);
      newGameState.turnNb = gameState.turnNb;
      newGameState.remainingAction = gameState.remainingAction;
      newGameState.id = gameState.id;
      newGameState.Board = [];
      for (let y = 0; y < gameState.gameParams.boardHeight; y++) {
        newGameState.Board.push([])
        for (let x = 0; x < gameState.gameParams.boardLength; x++) {
          newGameState.Board[y][x] = new Tile(newGameState, x, y, gameState.Board[y][x]);
        }
      }
      newGameState.topTiles = gameState.topTiles;
      newGameState.bottomTiles = gameState.bottomTiles;
      let playerList = [];
      for (let player of gameState.gameParams.playerList) {
        let newPlayer = await copyPlayer(player, gameState.id);
        playerList.push(newPlayer);
      }
      newGameState.gameParams.playerList = playerList;
      GameState.onGoing[gameState.id] = newGameState;
    }
    return GameState.onGoing[gameState.id];
  }

  /**
   * 
   * @param {GameParams} GameParams 
   */
  constructor(gameParams,newGame=true){
    if(newGame===false)return;
    this.gameParams = new GameParams(gameParams);

    this.id=Date.now()
    GameState.onGoing[this.id] = this;

    this.remainingAction = this.gameParams.numActions;
    this.turnNb = 1

    this.Board = [];
    for(let y=0;y<this.gameParams.boardHeight;y++){
      this.Board.push([])
      for(let x=0;x<this.gameParams.boardLength;x++){

        this.Board[y][x] = new Tile(this,x,y,null);
      }
    }

    this.topTiles = [];
    this.bottomTiles = [];
    for (var i = 0; i < this.gameParams.boardLength; i++) {
      this.topTiles.push(this.Board[this.gameParams.boardHeight-1][i].getCoords());
      this.bottomTiles.push(this.Board[0][i].getCoords());
    }
  }

  /**
   * 
   * @returns {Tile[][]}
   */
  getBoard(){
    return this.Board;
  }
/**
 * 
 * @returns {number}
 */
  getTurnNb(){
    return this.turnNb;
  }
/**
 * 
 * @returns {PlayerGameInstance[]}
 */
  getPlayerList(){
    return this.gameParams.playerList;
  }
  /**
   * 
   * @param {PlayerAccount[]} accountList 
   */
  async setPlayers(accountList,randomise){
    let firstPlayer;
    let secondPlayer;
    //TODO Recup player Account thanks to ID
    if(!randomise || Math.round(Math.random())==0){
      firstPlayer = accountList[1];
      secondPlayer = accountList[0];
    }
    else {
      firstPlayer = accountList[0];
      secondPlayer = accountList[1];
    }
    firstPlayer = new PlayerGameInstance(firstPlayer,this.topTiles,this.bottomTiles,1,this.gameParams.nbWallsPerPlayer,this.id);
    secondPlayer = new PlayerGameInstance(secondPlayer,this.bottomTiles,this.topTiles,-1,this.gameParams.nbWallsPerPlayer,this.id);
    this.gameParams.playerList = []
    this.gameParams.playerList.push(firstPlayer);
    this.gameParams.playerList.push(secondPlayer);
  }
  /**
   * 
   * @returns {PlayerGameInstance}
   */
  currentPlayer(){
    let PL = this.gameParams.playerList
    return PL[this.turnNb%PL.length]
  }
  /**
   *
   * @param {Number} x abscisse
   * @param {Number} y ordonnée
   * @returns {Tile} la tuile correspondante ou null.
   */
  getTile(x, y) {
    if(x==null || y==null)return null;
    
    if(x<0 || x>=this.gameParams.boardLength || y<0 || y>=this.gameParams.boardHeight) return null;
    return this.Board[y][x];
  }
  /**
   * 
   * @param {Number} x 
   * @param {Number} y 
   * @param {Direction} dir 
   * @return {Border | null}
   */
  wallAtDir(x,y,dir){
    if(dir==null)return null;
    if(dir == Direction.Left){
      dir = Direction.Right
      x--;
    }
    else if(dir == Direction.Up){
      dir = Direction.Down
      y++;
    }
    let tile = this.getTile(x,y);
    if(tile==null) return null;
    if(dir == Direction.Right) return tile.BorderR
    else return tile.BorderD;
    
  }
  /**
   * 
   * @param {Tile} Tile 
   * @param {Direction} dir 
   * @returns {Tile | null}
   */
  getTileIn(Tile,dir){
      switch(dir){
        case Direction.Up:
          return this.getTile(Tile.X+1,Tile.Y);
        case Direction.Down:
          return this.getTile(Tile.X,Tile.Y-1);
        case Direction.Left:
          return this.getTile(Tile.X-1,Tile.Y);
        case Direction.Right:
          return this.getTile(Tile.X+1,Tile.Y);
        default:
          console.error("invalid arguments");
      }
    }
  /**
   * 
   * @param {Number} playerId 
   * @param {{X:Number,Y:Number}} co 
   */
  placePlayer(playerId, co){
    //find player with same id as playerId in playerList
    let me = null;
    for(let i=0;i<this.gameParams.playerList.length;i++){
        if(this.gameParams.playerList[i].getid()==playerId){
            me = this.gameParams.playerList[i];
            continue;
        }
    }
    this.getTile(co.X,co.Y).occupiedBy(me)
  }
  GameWinner(){
    let winners = []
    let players = this.gameParams.playerList

    for (let i=0;i<players.length;i++){
      let player = players[i]
      if(player.end.length == 0 || player.getTile()==null)continue;
      for(let coords of player.end){
        let currentCoords = player.getTile().getCoords();
        if(currentCoords.X == coords.X && currentCoords.Y == coords.Y)winners.push(player);
      }
    }
    // si c'est le dernier joueur
    // et si il y a des gagnants
    if((this.turnNb%players.length==players.length-1) && (winners.length!=0) ) {

      return winners
    }
    
    return null;
  }
  
  actionDone(){
    this.remainingAction--; 
    if(this.remainingAction<=0){
      this.remainingAction = this.gameParams.numActions;
      this.turnNb++;
    } 
    
  }
  /**
   * 
   * @param {PlayerGameInstance} player 
   * @return {{Board:TileFront[],Positions:{X:Number,Y:Number}}}
   */
  setUpBoard(player){
    let resultPos= [];
    if(player.end[0].X == player.end[player.end.length-1].X){
      if(player.end[0].X>this.gameParams.boardLength/2) for(let y=0;y<this.gameParams.boardHeight;y++)resultPos.push({X:0, Y:y})
      else for(let y=0;y<this.gameParams.boardHeight;y++) resultPos.push({X:this.gameParams.boardLength-1, Y:y})
    }else if(player.end[0].Y == player.end[player.end.length-1].Y){
      if(player.end[0].Y>this.gameParams.boardHeight/2) for(let x=0;x<this.gameParams.boardLength;x++)resultPos.push({X:x, Y:0})
      else for(let x=0;x<this.gameParams.boardLength;x++) resultPos.push({X:x, Y:this.gameParams.boardHeight-1})
    }else console.error("Heu la le tiles de fin devraient etre soit sur la meme ligne soit sur la meme colonne");
    let board = []
    for(let y=0;y<this.gameParams.boardHeight;y++){
      board[y] = []
      for(let x=0;x<this.gameParams.boardLength;x++) board[y].push(this.Board[y][x].toFront(player));
    }

    return {Board:board,Positions:resultPos};
  }
  
  
  /**
   * 
   * @param {PlayerGameInstance} player 
   */
  BoardFor(player){
    let result = []
    for(let y=0;y<this.gameParams.boardHeight;y++){
      result[y] = []
      for(let x=0;x<this.gameParams.boardLength;x++){
        result[y].push(this.Board[y][x].toFront(player));
      }
    }
    return result;
  }
  
  /**
   * 
   * @param {Border[]} additionnalWalls 
   * @returns 
   */
  playersCanReachEnd(additionnalWalls = []){
    for(let player of this.gameParams.playerList){
      if(player.end==null|| player.end.length==0)continue;
      let path= this.aStar({start:player.getTile(),ends:player.end,addWalls: additionnalWalls})
      if(path==null) return false;
      
    }
    return true;
  }

  
  /**
   * 
   * @param {{start:Tile,end:Tile[],MaxCost:Number,jumpWall:Boolean,addWalls:Border[]}} param0 
   * @returns 
   */
  aStar({start=null ,ends=null, maxCost = null,opponentBlock = false,jumpWall = false, addWalls = []}= {}){
    if(start==null || ends ==null)return null;
    let killTimer=this.gameParams.boardLength*this.gameParams.boardHeight;
    /**
     * 
     * @param {Tile} tile 
     * @returns {Number}
     */
    function heuristic(tile){
      let nearestDist = null;
      let closestEnd = null;
      for(let end of ends) {
        let dist = Math.abs(tile.X-end.X)+Math.abs(tile.Y-end.Y)
        if(nearestDist ==null || dist<nearestDist){
          nearestDist = dist;
          closestEnd=end;

        }

      }
      return distTo(tile,closestEnd);
    }
  
    let explored= [];
  
    let frontier =[{
      node : start,
      cost : 0,
      estimate : heuristic(start),
      previous : null
    }]
  
  
    while(frontier.length>0){
      if(killTimer--<=0) {console.log("aStar too long");return null;}
  
      frontier.sort((a,b)=>{
        let diff = (a.estimate+a.cost)-(b.estimate+b.cost);
        if(diff!=0)return diff;
        else return Math.random() > 0.5 ? 1 : -1
      });
  
      let currentBest = frontier.shift();
      for(let end of ends) if(currentBest.node.X == end.X && currentBest.node.Y == end.Y) {
        if(maxCost!=null && maxCost<currentBest.cost){
          console.log("tooExpensive")
          return null;
        } 
        else {
          return currentBest;
        }
      }
  
      explored.push(currentBest)
      for(let step of currentBest.node.getNeighbour(jumpWall,addWalls)){
        let cost = currentBest.cost+1;
        let isExplored = (explored.find( e => {
            return e.node.X == step.X 
            &&  e.node.Y == step.Y
            && e.cost<=cost;
        }))
  
        let isFrontier = (frontier.find( e => {
            return e.node.X == step.X 
            &&  e.node.Y == step.Y
            && e.cost<=cost;
        }))
  
        if (!isExplored && !isFrontier) {
          frontier.push({
            node: step,
            cost: cost,
            estimate: heuristic(step),
            previous : currentBest
          });
        }
      }
    }
    console.log("impossible to reach")
    return null;
  }
  
  /**
   * 
   * @param {Number} playerId 
   * @returns 
   */
  execRandomMove(playerId){
    
    let player = null
    let playerList = this.getPlayerList()
    for(let i=0;i<playerList.length;i++){
        if(playerList[i].getid()==playerId){
            player = playerList[i];
            continue;
        }
    }
    if(player==null)return;
    let play;
    if(player.nbWalls>0 && Math.random()>0.5){
      let played
        do {
          let x = Math.floor(Math.random()*this.gameParams.boardLength);
          let y = Math.floor(Math.random()*this.gameParams.boardHeight);
          let vertical = Math.random()>0.5;
          play = createWall(this,player,x,y,vertical);
          if(play==null) played = false;
          else played = play.execute();
        }while(!played)
    }else{
        let played
        do {
            let possiblepos=[]
            if(player.OnTile.X+1<this.gameParams.boardLength) possiblepos.push([player.OnTile.X+1,player.OnTile.Y])
            if(player.OnTile.X-1>=0) possiblepos.push([player.OnTile.X-1,player.OnTile.Y])
            if(player.OnTile.Y+1<this.gameParams.boardHeight) possiblepos.push([player.OnTile.X,player.OnTile.Y+1])
            if(player.OnTile.Y-1>=0) possiblepos.push([player.OnTile.X,player.OnTile.Y-1])
            let move=possiblepos[Math.floor(Math.random()*possiblepos.length)]

            let x = Math.floor(move[0]);
            let y = Math.floor(move[1]);

            play = new Move(this.id,player,x,y);
            if(play==null) played = false;
            else played = play.execute();
        }while(!played)
    }
  
    return play;
  }

}
class TileFront {
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} maxX
   * @param {Number} minY
   * @param {PlayerGameInstance | Boolean} occupiedBy
   */
  constructor(x, y, bRight, bDown, edge, occupiedBy=false, boardLength) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.occupied = occupiedBy;
    this.right = x != boardLength;
    this.down = y != 0;
    this.BorderR = bRight;
    this.BorderD = bDown;
    this.Edge = edge;

  }
}
class BorderFront{
  constructor(x, y, lng, lat ,color, playerId) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.color = color;
    this.lng = lng;
    this.lat = lat;
    this.playerId = playerId;
  }
}

class PlayerGameInstance {

  /**
   *

   * @param {profile.PlayerAccount} account
   * @param {{X:Number,Y:Number} []} startPos
   * @param {{X:Number,Y:Number} []  | null} endPos
   * @param {Number} modifier
   * @param {Number} nbWallsPerPlayer 
   * @param {Number} gameId
   */
  constructor(account,startPos,endPos, modifier, nbWallsPerPlayer, gameId) {
    if(startPos==null || startPos.length==0) return null;
    this.gameId = gameId;
    this.modifier = modifier;
    this.username = account.username
    if(account.difficulty!=null)this.difficulty = account.difficulty
    if(account.fakePlayer!=null)this.fakePlayer = account.fakePlayer
    this.nbWalls = nbWallsPerPlayer;
    this.start=startPos
    this.end = endPos
    this.OnTile = null;
    if(modifier==1) {
      this.color = profile.Color.red
      this.playerSkin = account.skins.humanSkin
    }
    else {
      this.color = profile.Color.blue
      this.playerSkin = account.skins.beastSkin
    }
    if (endPos == null) console.info("ce joueur ne peux pas gagner")
  }
  /**
   * 
   * @returns {{X:Number,Y:Number}}
   */
  getPos(){
    return this.OnTile;
  }
  /**
   * @returns {Tile}
   */
  getTile(){
    if(this.OnTile==null)return null;
    return findGame(this.gameId).getTile(this.OnTile.X,this.OnTile.Y);
  }
  getColorStyle(){
    return this.color;
  }
  getid(){
    return this.username;
  }

}
class Tile {
  /**
   *
   * @param {GameState} gameState
   * @param {Number} x
   * @param {Number} y
   * @param Tile
   */
  constructor(gameState, x, y, Tile = null) {
    this.gameStateId = gameState.id;
    if (Tile === null) {
      this.X = Math.floor(x);
      this.Y = Math.floor(y);
      this.occupied = null;
      let gameParams = findGame(this.gameStateId).gameParams
      if (y + 1 < gameParams.boardHeight / 2) this.visibility = -1;
      else if (y + 1 == (gameParams.boardHeight / 2) + 0.5) this.visibility = 0;
      else this.visibility = 1;

      this.BorderR = new Border(this.gameStateId, x, y, true, false);
      this.BorderD = new Border(this.gameStateId, x, y, false, true);
      this.Edge = new Border(this.gameStateId, x, y, true, true);
    } else {
      this.X = Tile.X;
      this.Y = Tile.Y;

      if (Tile.occupied != null) {
        this.occupied = copyPlayer(Tile.occupied, this.gameStateId);
      }
      else this.occupied = null;
      this.visibility = Tile.visibility;
      this.BorderR = new Border(this.gameStateId, null, null, null, null, Tile.BorderR);
      this.BorderD = new Border(this.gameStateId, null, null, null, null, Tile.BorderD);
      this.Edge = new Border(this.gameStateId, null, null, null, null, Tile.Edge);
    }

  }

  /**
   * 
   * @param {PlayerGameInstance} player 
   */
  occupiedBy(player) {
    let game = findGame(this.gameStateId)
    let GP = game.gameParams
    if(player!=null){
      let old = player.getTile()
      if(old != null) old.occupiedBy(null);
      player.OnTile = {X:this.X,Y:this.Y};
      for(let modX=-GP.SightDistance;modX<=GP.SightDistance;modX++) for(let modY=-GP.SightDistance;modY<=GP.SightDistance;modY++){
        if(Math.abs(modX)+Math.abs(modY)>GP.SightDistance) continue;
        let lighten = game.getTile(this.X+modX,this.Y+modY);
        if(lighten!=null) {
          lighten.changeVisibility(player.modifier*GP.sightForce);
        }
        if(old!=null){
          let darken = game.getTile(old.X+modX,old.Y+modY)
          if(darken!=null) {
            darken.changeVisibility(-player.modifier*GP.sightForce);
          }
        }
      }
    }
    this.occupied = player;
  }

  /**
   * 
   * @param {PlayerGameInstance} player 
   * @returns 
   */
  toFront(player) {
    let visi;
    let game = findGame(this.gameStateId)
    if(this.occupied!=null && this.occupied.getid()==player.getid()) {
        visi = this.occupied;

    } else if (player.OnTile!=null && this.occupied!=null && distTo(this,game.getTile(player.OnTile.X,player.OnTile.Y))==1){
      visi = this.occupied;
    }else if(!game.gameParams.fog||this.visibility*player.modifier>=0) {
      if(this.occupied!=null) visi = this.occupied;
      else visi = true;
    } else visi = false;
    return new TileFront(this.X,this.Y,this.BorderR.toFront(),this.BorderD.toFront(),this.Edge.toFront(),visi,findGame(this.gameStateId).gameParams.boardLength);
  }
  changeVisibility(value){
    this.visibility+=value;
  }
  /**
   * 
   * @returns {Tile[]}
   */
  getNeighbour(jumpWalls=false, fictionnalWalls = []){
    let result = [];
    let game = findGame(this.gameStateId);
    let current = game.getTile(this.X,this.Y+1);
    if(current!=null && (jumpWalls || current.BorderD.wallBy==null) && !fictionnalWalls.includes(current.BorderD)) result.push(current);

    current = game.getTile(this.X+1,this.Y);
    if(current!=null && (jumpWalls || this.BorderR.wallBy==null ) && !fictionnalWalls.includes(this.BorderR)) result.push(current);

    current = game.getTile(this.X,this.Y-1);
    if(current!=null && (jumpWalls || this.BorderD.wallBy==null ) && !fictionnalWalls.includes(this.BorderD)) result.push(current);

    current = game.getTile(this.X-1,this.Y);
    if(current!=null && (jumpWalls || current.BorderR.wallBy==null ) && !fictionnalWalls.includes(current.BorderR)) result.push(current);
    return result;
  }
  /**
   * 
   * @param {Tile} tile 
   * @return {Direction[]}
   */
  tileInDir(tile){
    let result = [];
    let xDiff = this.X - tile.X;
    let yDiff = this.Y - tile.Y;
    if(Math.abs(xDiff)>Math.abs(yDiff)){
      if(xDiff<0) result.push(Direction.Right);
      else result.push(Direction.Left);
    }else if(Math.abs(xDiff)<Math.abs(yDiff)){
      if(yDiff<0) result.push(Direction.Up);
      else result.push(Direction.Down);
    }else{
      if(yDiff<0) result.push(Direction.Up);
      else result.push(Direction.Down);
      if(xDiff<0) result.push(Direction.Right);
      else result.push(Direction.Left);
    }
    return result;
  }
  /**
   * 
   * @param {Direction[]} dirs 
   */
  getTileInDir(dirs){
    let x = this.X;
    let y = this.Y
    for(let dir of dirs) {
      switch(dir){
      case Direction.Up:
        y++;
        break;
      case Direction.Right:
        x++
        break;
      case Direction.Down:
        y--;
        break;
      case Direction.Left:
        x--;
        break;
      }
    }
    return findGame(this.gameStateId).getTile(x,y);
  }

  getCoords(){
    return{X:this.X,Y:this.Y}
  }
}
class Border {
    /**
     *
     * @param {Number} gameStateId
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} lng
     * @param {Boolean} lat
     * @param {Border} Border
     */
    constructor(gameStateId, x, y, lng, lat, Border = null) {
      this.gameStateId = gameStateId;
      if (Border == null) {
        this.X = Math.floor(x);
        this.Y = Math.floor(y);
        this.lng = lng;
        this.lat = lat;
        this.wallBy = null;
      } else {
        this.X = Border.X;
        this.Y = Border.Y;
        this.lng = Border.lng;
        this.lat = Border.lat;
        if (Border.wallBy != null){
          this.wallBy =copyPlayer(Border.wallBy, this.gameStateId);
        }
        else this.wallBy = null;
      }
    }

  
    toFront(){
      return new BorderFront(this.X,this.Y,this.lng,this.lat,this.wallBy==null?null:this.wallBy.color.moy(profile.Color.black,0.9).toStyle(),this.wallBy==null?null:this.wallBy.id)
    }
    /**
     * 
     * @param {PlayerGameInstance} player
     */
    buildWall(player) {
      let game = findGame(this.gameStateId)
      let influence = []
      let num = (this.lng ? 1 : 0) + (this.lat ? 2 : 0)
      if(num == 1) // vertical border
        influence = [[0,0],[0,1],[-1,0],[0,-1],[1,0],[1,1],[2,0],[1,-1]];
      else if(num == 2) // horizontal border
        influence = [[0,0],[-1,0],[0,1],[1,0],[0,-1],[-1,-1],[0,-2],[1,-1]];
      else if(num == 3) // edge
        influence = [];
      this.wallBy = player;
      for(let coord of influence){
        let x = coord[0] + this.X;
        let y = coord[1] + this.Y;
        let tile = game.getTile(x,y);
        if(tile != null ) tile.changeVisibility(this.wallBy.modifier);
      }
    }
  }
  const Direction = {
    Up: "up",
    Right: "right",
    Down: "down",
    Left: "left",
  };
  
  
  
  /**
   * 
   * @param {GameParams | null} gameParams 
   */
  function init(gameParams) {
    return new GameState(gameParams).id;
  }
  
  /**
   * 
   * @param {GameState} game
   */
  function retrieveGame(game){
    return GameState.loadGame(game);
  }
  
  /**
   * 
   * @param {Number} x 
   * @param {Number} y 
   * @param {Direction} dir 
   * @return {Border | null}
   */
  function wallAtDir(gameId, x,y,dir){
    if(dir==null)return null;
    if(dir == Direction.Left){
      dir = Direction.Right
      x--;
    }
    else if(dir == Direction.Up){
      dir = Direction.Down
      y++;
    }
    let tile = getTile(x,y);
    if(tile==null) return null;
    if(dir == Direction.Right) return tile.BorderR
    else return tile.BorderD;
    
  }
  
  function wallAt(gameId, fx,fy,tx,ty){
    if(Math.abs(fx-tx)+ Math.abs(fy-ty)!=1) return null;
    if(fy==ty){
      if(fx<tx) return wallAtDir(fx,fy,Direction.Right);
      else return wallAtDir(tx,ty,Direction.Right);
    }else{
      if(fy<ty) return wallAtDir(tx,ty,Direction.Down);
      else return wallAtDir(fx,fy,Direction.Down);
    }
  }
  /**
   * 
   * @param {Tile} from 
   * @param {Tile} to 
   * @returns {Border | null}
   */
  function wallBetween(from,to){
    return wallAt(from.X,from.Y,to.X,to.Y);
  }
  

  
  /**
   * 
   * @param {Tile} from 
   * @param {Tile} to 
   * @returns {Number} dist between the two tiles
   */
  function distTo(from,to){
    return Math.abs(from.X-to.X) + Math.abs(from.Y-to.Y);
  }



  class Action {
    /**
     * 
     * @param {PlayerGameInstance} player 
     */
    constructor(player){
      this.player = player;
    }
    /**
     * 
     * @returns {Boolean}
     */
    canExecute(gameId){
      return this.player == currentPlayer(gameId);
    }
    highlight(){
      console.error("highlight not defined in sub class")
    }
    execute(){
      console.error("execute not defined in sub class")
    }
  }
  
  class Move extends Action{
    /**
     * 
     * @param {PlayerGameInstance} player 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(gameId, player, x,y){
      super(player);
      this.game = findGame(gameId)
      let start = player.getTile();
      let end = this.game.getTile(x,y);
      if(start==end)return undefined;
      let dirs = start.tileInDir(end);
      let path = this.game.aStar({start:start,ends:[end],maxCost:this.game.gameParams.travelDist});
      if(path==null) return undefined;
      while(path.node.occupied!=null){
        if(end==null) return undefined;
        path = this.game.aStar({start,ends:[end],maxCost:dirs.length,jumpwall:this.game.gameParams.jumpOverWall});
        if(path==null) return undefined;
        start = end;
        end = path.node.getTileInDir(dirs);
      }
      this.X = path.node.X;
      this.Y = path.node.Y;
  
    }
    
    execute(){
      if(!this.canExecute(this.game.id)) return false;
      let tile = this.game.getTile(this.X,this.Y);
      if(tile==null)return false;
      tile.occupiedBy(this.player);
      this.game.actionDone();
      return true;
    }
  }
  
  class Wall extends Action{
    /**
     * 
     * @param {PlayerGameInstance} player
     * @param {Border[]} borders 
     */
    constructor(gameId, player,borders){
      super(player)
      this.game = findGame(gameId)
      this.borders = borders;
    }
    execute(){
      if(!this.canExecute(this.game.id) || this.player.nbWalls<=0)return false;
      for(let border of this.borders) border.buildWall(this.player)
      this.player.nbWalls--;
      this.game.actionDone();
      return true;
    }
  }






  /**
   * 
   * @param {Number} gameId 
   * @param {PlayerGameInstance} player 
   * @param {Number} x 
   * @param {Number} y 
   * @returns 
   */
  function execMove(gameId, player, x, y){
    let move = new Move(gameId, player, x, y);
    if(move==undefined) return false;
    return move.execute();

  }

  /**
   * 
   * @param {GameState} game 
   * @param {PlayerGameInstance} player 
   * @param {Number} x 
   * @param {Number} y 
   * @param {boolean} vertical 
   * @returns 
   */
  function createWall(game, player, x, y, vertical){
    let borders = []
    if(game.getTile(x,y) == null) return null  
    if(vertical) {
      borders = [game.getTile(x,y).BorderR]
      for(let i=0;i<game.gameParams.wallLength-1;i++){
        let test = game.getTile(x,y+1+i)
        if(test == null) return null
        borders.push(test.Edge)
        borders.push(test.BorderR)
      }
    }
    else {
      borders = [game.getTile(x,y).BorderD]
      for(let i=0;i<game.gameParams.wallLength-1;i++){
        let test = game.getTile(x+1+i,y)
        if(test == null)return null
        borders.push(game.getTile(x+i,y).Edge);
        borders.push(test.BorderD);
      }
    }
    for(let border of borders) if(border.wallBy!=null) return null;
    if(game.playersCanReachEnd(borders)) return new Wall(game.id, player,borders);
    return null
  }

  function execWall(gameId, player, x, y, vertical){
    let game = findGame(gameId)
    if(game.gameParams.wallLength===0)return false;
    let wall = createWall(game, player,x,y,vertical);
    if (wall==null) return false;
    return wall.execute();
  }



  
function getBoard(gameId){
  let game = findGame(gameId)
  if(game ==null) return null;
  return game.getBoard();
}

function getTurnNb(gameId){
  let game = findGame(gameId)
  if(game ==null) return null;
  return game.getTurnNb();
}

function getPlayerList(gameId){
  let game = findGame(gameId)
  if(game ==null) return null;
  return game.getPlayerList();
}
function BoardFor(gameId, player){let game = findGame(gameId)
  if(game ==null) return null;
  return game.BoardFor(player);
}
function GameWinner(gameId){
  let game = findGame(gameId)
  if(game ==null) return null;
  return game.GameWinner()
}
function currentPlayer(gameId){
  let game = findGame(gameId)
  if(game ==null) return null;
  return game.currentPlayer()
}
/**
 * 
 * @param {number} gameId 
 * @param {PlayerGameInstance} player 
 * @returns 
 */
function setUpBoard(gameId, player){
  let game = findGame(gameId)
  if(game ==null) return null;
  return game.setUpBoard(player)
}
function placePlayer(gameId,playerId ,coords){
  let  game = findGame(gameId)
  if(game ==null) return null;
  return game.placePlayer(playerId,coords)
}
function execRandomMove(gameId,playerId){
  let game = findGame(gameId)
  if(game ==null) return null;
  return game.execRandomMove(playerId)
}
/**
 * 
 * @param {string} gameId 
 * @param {PlayerAccount[]} playersAccount 
 * @returns 
 */
function setPlayers(gameId,playersAccount,randomise = true){
  let game = findGame(gameId);
  if(game ==null) return null;
  return game.setPlayers(playersAccount,randomise);
}
function execRandomMove(gameId,move){
  let game = findGame(gameId);
  if(game ==null) return null;
  return game.execRandomMove(move);
}

  
/**
 * 
 * @param {Border[]} additionnalWalls 
 * @returns 
 */
function playersCanReachEnd(gameId, additionnalWalls = []){
  let game = findGame(gameId);
  if(game ==null) return null;
  return game.playersCanReachEnd(additionnalWalls);
    
}
/**
 * 
 * @param {Number} gameId 
 */
function deleteGame(gameId){
  delete GameState.onGoing[gameId]
}

/**
 *
 * @param {PlayerGameInstance} player
 * @param {Number} gameStateId
 * @returns {PlayerGameInstance}
 */
async function copyPlayer(player, gameStateId) {
  //create a PlayerGameInstance with the same attributes as player
  let newPlayer;
  if (player.username === profile.PlayerAccount.Guest().username) {
    newPlayer = new PlayerGameInstance(profile.playerAccount.Guest(), player.start, player.end, player.modifier, player.nbWalls, newGameState.id);
  } else if (player.username === profile.PlayerAccount.Bot().username) {
    newPlayer = new PlayerGameInstance(profile.PlayerAccount.Bot(), player.start, player.end, player.modifier, player.nbWalls, newGameState.id);
  } else {
    let account = await apiQuery.getUser(player.username);
    newPlayer = new PlayerGameInstance(account, player.start, player.end, player.modifier, player.nbWalls, gameStateId);
  }
  newPlayer.OnTile = player.OnTile;
  newPlayer.nbWalls = player.nbWalls;
  newPlayer.playerSkin = player.playerSkin;
  newPlayer.color = new profile.Color(player.color.R, player.color.G, player.color.B)
  return newPlayer;
}

/**
 * 
 * @param {string} gameId 
 * @returns {GameState}
 */
function findGame(gameId){
  return GameState.onGoing[gameId]
}

function getNbWalls(playerList){
    let res = [];
    for(let player of playerList){
        res.push(player.username+":"+player.nbWalls);
    }
    return res;
}
  exports.setPlayers = setPlayers;
  exports.getBoard = getBoard;
  exports.getTurnNb = getTurnNb;
  exports.getPlayerList = getPlayerList;
  exports.init = init;
  exports.BoardFor = BoardFor;
  exports.execMove = execMove;
  exports.execWall = execWall;
  exports.GameWinner = GameWinner;
  exports.CurrentPlayer = currentPlayer;
  exports.setUpBoard = setUpBoard;
  exports.placePlayer = placePlayer;
  exports.execRandomMove = execRandomMove;
  exports.deleteGame = deleteGame;
  exports.retrieveGame = retrieveGame;
  exports.getGameState = findGame;
  exports.GameState = GameState;
  exports.getNbWalls = getNbWalls;
