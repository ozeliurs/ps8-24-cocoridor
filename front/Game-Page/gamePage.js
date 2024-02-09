class Color{

static black = new Color(0  ,0  ,0  );
static red   = new Color(255,0  ,0  );
static green = new Color(0  ,255,0  );
static blue  = new Color(0  ,0  ,255);
static white = new Color(255,255,255);

  constructor(r,g,b){
    this.R = r;
    this.G = g;
    this.B = b;
  }

  /**
   * 
   * @param {Color} c 
   * @returns 
   */
  moy(c,per=0.5){
    let r = this.R;
    let g = this.G;
    let b = this.B;
    return new Color((c.R*(1-per)+r*per)/2,(c.G*(1-per)+g*per)/2,(c.B*(1-per)+b*per)/2)
  }

  toStyle(){
    return "rgb("+this.R+","+this.G+","+this.B+")"
  }
}

class Player {
  /**
   * 
   * @param {Number} modifier 
   * @param {Tile} startPos 
   * @param {Tile[]} endPos 
   * @param {Number} id
   */
  constructor(modifier,startPos,endPos,id) {
    
    this.id = id;
    this.modifier = modifier;
    this.start = startPos.getCoords();
    this.end = [];
    for(let tile of endPos)this.end.push(tile.getCoords())
    this.nbWalls = nbWallsPerPlayer;
    switch (modifier) {
      case -1:
        this.image = "./image1.png";
        this.color = Color.blue
        break;

      case 1:
        this.image = "./image2.png";
        this.color = Color.red
        break;

      default:
        console.error("unknown player modifier")
        break;
    }
    if(startPos!=null)startPos.occupiedBy(this);
    if(endPos==null)console.info("ce joueur ne peux pas gagner")
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
    return getTile(this.OnTile.X,this.OnTile.Y);
  }
  getColorStyle(){
    return this.color;
  }
  getid(){
    return this.id;
  }
}

class Tile {
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} maxX
   * @param {Number} maxY
   */
  constructor(x, y, maxX, maxY) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.occupied = null;
    this.groupElement = document.createElement("div");
    this.groupElement.classList.add("tileGroup");

    this.element = document.createElement("div");
    this.element.addEventListener("click", this.onClick.bind(this));
    this.element.classList.add("tile");
    this.groupElement.appendChild(this.element);
    let right = x != maxX;
    let down = y != 0;

    if(y+1<boardHeight/2) this.visibility = -1;
    else if(y+1==(boardHeight/2)+0.5) this.visibility = 0;
    else this.visibility = 1;

    this.BorderR = new Border(x, y, true, false);
    this.groupElement.appendChild(this.BorderR.element);
    if (!right) {
      this.BorderR.element.style.width = 0;
      
    }
    this.BorderD = new Border(x, y, false, true);
    this.groupElement.appendChild(this.BorderD.element);
    if (!down) this.BorderD.element.style.width = 0;
    this.Edge = new Border(x, y, true, true);
    this.groupElement.appendChild(this.Edge.element);
    if (!right || !down) this.Edge.element.style.width = 0;
  }
  /**
   * 
   * @param {Player} player 
   */
  occupiedBy(player) {
    if(player!=null){
      let old = player.getTile()
      if(old != null) old.occupiedBy(null);
      player.OnTile = {X:this.X,Y:this.Y};
      for(let modX=-SightDistance;modX<=SightDistance;modX++) for(let modY=-SightDistance;modY<=SightDistance;modY++){
        if(Math.abs(modX)+Math.abs(modY)>SightDistance) continue;
        let lighten = getTile(this.X+modX,this.Y+modY);
        if(lighten!=null) {
          lighten.changeVisibility(player.modifier*sightForce);
        }
        if(old!=null){
          let darken = getTile(old.X+modX,old.Y+modY)
          if(darken!=null) {
            darken.changeVisibility(-player.modifier*sightForce);
          }
        }
      }
    } 
    this.occupied = player;
    this.updateTile()
  }

  onClick() {
    if(currentPlayer()==this.occupied) return;
    let move = new Move(currentPlayer(),this.X,this.Y);
    
    if(move == undefined)return;
    move.execute();
    console.log(move);
    socket.emit('move', move);
    console.log("move");

  }
  updateTile() {
    this.element.innerHTML = this.visibility;
    if (this.occupied != null) {
      this.element.style.backgroundColor=this.occupied.color.toStyle();
    } else {
      this.element.style.backgroundColor="";
    }
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
    let current = getTile(this.X,this.Y+1);
    if(current!=null && (jumpWalls || current.BorderD.wall==0) && !fictionnalWalls.includes(current.BorderD)) result.push(current);
    current = getTile(this.X+1,this.Y);
    if(current!=null && (jumpWalls || this.BorderR.wall==0 ) && !fictionnalWalls.includes(this.BorderR)) result.push(current);
    current = getTile(this.X,this.Y-1);
    if(current!=null && (jumpWalls || this.BorderD.wall==0 ) && !fictionnalWalls.includes(this.BorderD)) result.push(current);
    current = getTile(this.X-1,this.Y);
    if(current!=null && (jumpWalls || current.BorderR.wall==0 ) && !fictionnalWalls.includes(current.BorderR)) result.push(current);
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
      if(xDiff<0) result.push(Direction.Right);
      else result.push(Direction.Left);
      if(yDiff<0) result.push(Direction.Up);
      else result.push(Direction.Down);
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
    return getTile(x,y);
  }

  getCoords(){
    return{X:this.X,Y:this.Y}
  }
}

class Border {
  constructor(x, y, lng, lat) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.wall = 0;
    this.generateElement(lng, lat);
  }
  generateElement(lng, lat) {
    this.element = document.createElement("div");
    switch ((lng ? 1 : 0) + (lat ? 2 : 0)) {
      case 1: // vertical border
        this.element.classList.add("verticalBorder");
        this.influence = [[0,0],[0,1],[-1,0],[0,-1],[1,0],[1,1],[2,0],[1,-1]];
        this.element.addEventListener("click", () => this.onClick(true));
        break;
      case 2: // horizontal border
        this.element.classList.add("horizontalBorder");
        this.influence = [[0,0],[-1,0],[0,1],[1,0],[0,-1],[-1,-1],[0,-2],[1,-1]];
        this.element.addEventListener("click", () => this.onClick(false));
        break;
      case 3: // edge
        this.element.classList.add("edge");
        this.influence = [];
        break;
    }
  }
  /**
   * 
   * @param {Player} player 
   */
  buildWall(player) {
    this.element.style.backgroundColor= player.color.moy(Color.black,0.9).toStyle();
    this.wall = player.modifier;
    for(let coord of this.influence){
      let x = coord[0] + this.X;
      let y = coord[1] + this.Y;
      let tile = getTile(x,y);
      if(tile != null ) tile.changeVisibility(this.wall);
    }
  }
  /**
   * 
   * @param {Boolean} vertical
   */
  onClick(vertical) {
    if(wallLength==0)return;
    let borders = []
    if(vertical) {
      borders = [getTile(this.X,this.Y).BorderR]
      for(let i=0;i<wallLength-1;i++){
        borders.push(getTile(this.X,this.Y+1+i).Edge)
        borders.push(getTile(this.X,this.Y+1+i).BorderR)
      }
    }
    else {
      borders = [getTile(this.X,this.Y).BorderD]
      for(let i=0;i<wallLength-1;i++){
      borders.push(getTile(this.X+i,this.Y).Edge);
      borders.push(getTile(this.X+1+i,this.Y).BorderD);
      }
    }
    for(let border of borders) if(border.wall!=0) return;
    if(playersCanReachEnd(borders)) new Wall(currentPlayer(),borders).execute();
    //server : envoyer le wall au server

      
    
  }
}

class Action {
  /**
   * 
   * @param {Player} player 
   */
  constructor(player){
    this.player = player;
  }
  /**
   * 
   * @returns {Boolean}
   */
  canExecute(){
    return this.player == currentPlayer();
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
   * @param {Player} player 
   * @param {Number} x 
   * @param {Number} y 
   */
  constructor(player, x,y){
    super(player);
    let start = currentPlayer().getTile();
    let end = getTile(x,y);
    let dirs = start.tileInDir(end);
    let path = aStar({start:start,end:end,maxCost:travelDist});
    if(path==null) return undefined;
    while(path.node.occupied!=null){
      path = aStar({start,end,maxCost:dirs.length,jumpwall:jumpOverWall});
      if(path==null) return undefined;
      start = end;
      end = path.node.getTileInDir(dirs);
    }
    this.X = path.node.X;
    this.Y = path.node.Y;

  }
  
  execute(){
    if(!this.canExecute()) return;
    let tile = getTile(this.X,this.Y);
    if(tile==null)return;
    tile.occupiedBy(this.player);
    actionDone();
  }
}

class Wall extends Action{
  /**
   * 
   * @param {Player} player
   * @param {Border[]} borders 
   */
  constructor(player,borders){
    super(player)
    this.borders = borders;
  }
  execute(){
    if(!this.canExecute() || this.player.nbWalls<=0)return null;
    for(let border of this.borders) border.buildWall(this.player)
    this.player.nbWalls--;
    actionDone();
  }
}

Board = [];
//Game rules
const numActions = 1; //number of action per turn
const travelDist = 1; //number of tiles a player can travel in one action
const SightDistance = 1; //number of tiles the player has visibility around him
const lineOfSight = false; // po implemente
const wallLength = 2; // length of the wall built
const jumpOverWall = false; // if players can jump above walls by jumping on another player
const nbWallsPerPlayer = 10 //number max of wall a player can place
const absoluteSight = false;
const sightForce = 1;
//Games data
let remainingAction = numActions;
let boardLength = 0;
let boardHeight = 0;
let turnNb = 0;
let playerList = [];
validAction = null;

const Direction = {
  Up: "up",
  Right: "right",
  Down: "down",
  Left: "left",
};

/**
 *
 * @param {Number} x abscisse
 * @param {Number} y ordonnée
 * @returns {Tile} la tuile correspondante ou null.
 */
function getTile(x, y) {
  if(x==null || y==null)return null;
  if(x<0 || x>=boardLength || y<0 || y>=boardHeight) return null;
  return Board[y][x];
}

/**
 * 
 * @param {Tile} Tile 
 * @param {Direction} dir 
 * @returns 
 */
function getTileIn(Tile,dir){
  switch(dir){
    case Direction.Up:
      return getTile(Tile.X+1,Tile.Y);
    case Direction.Down:
      return getTile(Tile.X,Tile.Y-1);
    case Direction.Left:
      return getTile(Tile.X-1,Tile.Y);
    case Direction.Right:
      return getTile(Tile.X+1,Tile.Y);
    default:
      console.error("invalid arguments");
  }
}


function init(lng = 11, lat = 11) {
  boardLength = lng;
  boardHeight = lat;
  //CreateBoard
  for (y = boardHeight-1; y >= 0; y--) {
    Board[y] = [];
    for (x = 0; x < boardLength; x++) {
      let elemtCreated = new Tile(x, y, boardLength-1, boardHeight);

      let gameDiv = document.getElementById("game");
      gameDiv.style.cssText = "display : grid; grid-template-columns: repeat("+boardLength+", max-content); grid-template-rows: repeat("+boardHeight+", max-content);";
      gameDiv.appendChild(elemtCreated.groupElement);
      Board[y][x] = elemtCreated;
    }
  }
  //Place Player
  let topTiles = [];
  let bottomTiles = [];
  for (var i = 0; i < boardLength; i++) {
    topTiles.push(Board[boardHeight-1][i]);
    bottomTiles.push(Board[0][i])
  }
  playerList[0] = new Player(-1,bottomTiles[Math.round(boardLength/2)-1], topTiles,1);
  playerList[1] = new Player(1,topTiles[Math.round(boardLength/2+0.5)-1], bottomTiles,2);
  updateBoardVisibility()
}

function GameWinner(){
  let winners = []
  for (let i=0;i<playerList.length;i++){
    let player = playerList[i]
    if(player.end.length == 0 || player.getTile()==null)continue;
    let currentCoords = player.getTile().getCoords();
    if(player.end.find((e)=>e.X===currentCoords.X && e.Y===currentCoords.Y)!=undefined) winners.push(player);
  }
  
  return winners.length==0?null:winners;
}

function playerTurn(player) {
  action = null;

  while (action == null) action = validAction;
  //Execute action
  action = null;
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Direction} dir 
 * @return {Border | null}
 */
function wallAtDir(x,y,dir){
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

function wallAt(fx,fy,tx,ty){
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
 * @returns {Player} player that must play
 */
function currentPlayer(){
  return playerList[turnNb%playerList.length];
}

function actionDone(){

  remainingAction--;
  let winners = GameWinner();
  if(turnNb%playerList.length==playerList.length-1 && winners!=null && (winners.includes(playerList[playerList.length-1]) || remainingAction==0)) {
    if(winners.length==1) alert("Le joueur " + (playerList.indexOf(winners[0])+1) + " a gagné !");
    else alert("Il y a égalité");
    window.location.href = "../EndGame/endPage.html?winner=Joueur" + (playerList.indexOf(winners[0])+1);
    
  }
  if(remainingAction<=0){
    remainingAction=numActions;
    turnNb++;
    let playeTurn = document.getElementById("playerplaying");
    let player = currentPlayer();
    playeTurn.innerHTML = playerList.indexOf(player)+1;
    
    
  }
  let player = currentPlayer();
  updateBoardVisibility(player)
}

/**
 * 
 * @param {Player} player 
 */
function updateBoardVisibility(player = null){
  if(player==null) player = currentPlayer();
  for(let y=0;y<boardHeight;y++) for (let x = 0; x<boardLength; x++){
    let tile = getTile(x,y);
    tile.element.innerHTML = tile.visibility;
    /*if(tile.visibility * player.modifier>=0) tile.element.style.visibility="visible";//TODO faire changer les couleurs des cases au lieu de les cachers
    else if(absoluteSight && Math.abs(tile.X-player.OnTile.X) + Math.abs(tile.Y-player.OnTile.Y) <= SightDistance) tile.element.style.visibility="visible";
    else tile.element.style.visibility = "hidden";*/
  }
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
/**
 * 
 * @param {Border[]} additionnalWalls 
 * @returns 
 */
function playersCanReachEnd(additionnalWalls = []){
  for(let player of playerList){
    if(player.end==null|| player.end.length==0)continue;
    let foundPath = false
    for(let obj of player.end){
      let path = aStar({start:player.getTile(),end:obj,addWalls: additionnalWalls});
      if(path!=null){
        foundPath=true;
        break;}
    }
    if(!foundPath)return false;
  }
  return true;
}

function aStar({start=null ,end=null, maxCost = null,jumpWall = false, addWalls = []}= {}){
  if(start==null || end ==null)return null;
  let killTimer =500;
  /**
   * 
   * @param {Tile} tile 
   * @returns {Number}
   */
  function heuristic(tile){
    return distTo(tile,end);
  }

  /**
   * 
   * @param {Tile} tile 
   * @returns 
   */
  function progressOf(tile){
    return Math.abs(Math.abs((tile.X - start.X)/(end.X - start.X))-Math.abs((tile.Y - start.Y)/(end.Y - start.Y)))
  }

  let explored= [];

  let frontier =[{
    node : start,
    cost : 0,
    estimate : heuristic(start),
    previous : null
  }]


  while(frontier.length>0){
    let killTimer=boardLength*boardHeight;
    if(killTimer--<=0)return null;

    frontier.sort((a,b)=>{
      let diff = a.estimate-b.estimate;
      if(diff!=0) return diff;
      else {
        if(progressOf(a.node)<progressOf(b.node)) return -1;
        else return 1;
      }
    });

    let currentBest = frontier.shift();

    if(currentBest.node.X == end.X && currentBest.node.Y == end.Y) {
      if(maxCost!=null && maxCost<currentBest.cost){
        return null;
      } 
      else {
        return currentBest;
      }
    }

    explored.push(currentBest)
    
    for(let step of currentBest.node.getNeighbour(jumpWall,addWalls)){
      let isExplored = (explored.find( e => {
          return e.node.X == step.X && 
              e.node.Y == step.Y;
      }))

      let isFrontier = (frontier.find( e => {
          return e.node.X == step.X && 
              e.node.Y == step.Y;
      }))

      if (!isExplored && !isFrontier) {
        let cost = currentBest.cost+1;
        frontier.push({
          node: step,
          cost: cost,
          estimate: cost + heuristic(step),
          previous : currentBest
        });
      }
    }
  }
  console.log("impossible to reach")
  return null;
}
