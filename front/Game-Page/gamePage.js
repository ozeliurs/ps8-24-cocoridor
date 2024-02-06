class Player {
  constructor(modifier,startSide) {
    this.modifier = modifier;
    this.side = startSide;
    this.OnTile = null;
    switch (modifier) {
      case -1:
        this.image = "./image1.png";
        this.Color = "rgb(0, 0, 255);"
        break;

      case 1:
        this.image = "./image2.png";
        this.Color = "rgb(255, 0, 0);"
        break;

      default:
        console.error("unknown player modifier")
        break;
    }
  }
  /**
   * 
   * @returns {Tile}
   */
  getTile(){
    return this.OnTile;
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

    this.element.innerHTML=this.visibility
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
    if(player==null) this.occupied = player;
    else{
      if(player.OnTile != null) player.OnTile.occupiedBy(null);
      this.occupied = player;
      player.OnTile = this;
    } 
    console.log("update")
    this.updateTile()
  }

  onClick() {
    new Move(currentPlayer(),this.X,this.Y).execute();
  }
  updateTile() {
    if (this.occupied != null) {
      this.element.style="background-color:"+this.occupied.Color;
    } else {
      this.element.style=""
    }
  }
  changeVisibility(value){
    this.visibility+=value;
    this.element.innerHTML=this.visibility
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
        this.element.addEventListener("click", () => this.onClick(true, new Wall(currentPlayer(), this.X,this.Y,Direction.Right)));
        break;
      case 2: // horizontal border
        this.element.classList.add("horizontalBorder");
        this.influence = [[0,0],[-1,0],[0,1],[1,0],[0,-1],[-1,-1],[0,-2],[1,-1]];
        this.element.addEventListener("click", () => this.onClick(false, new Wall(currentPlayer(), this.X,this.Y,Direction.Down)));
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
    this.element.classList.add("wall");
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
   * @param {Wall} action 
   */
  onClick(vertical, action) {
    
    if(vertical) {
      if ((getTile(action.X,action.Y+1).Edge.wall ==0
      || getTile(action.X,action.Y).BorderR.wall
      || getTile(action.X,action.Y+1).BorderR.wall)
      ) action.execute();
    }
    else {
      if (!(getTile(action.X,action.Y).Edge.wall 
      || getTile(action.X,action.Y).BorderD.wall
      || getTile(action.X+1,action.Y).BorderD.wall)
      ) action.execute();
    }
    
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
   * @param {playeTurn} player 
   * @param {Number} x 
   * @param {Number} y 
   */
  constructor(player, x,y){
    super(player);
    this.X = x;
    this.Y = y;
    if(getTile(this.X,this.Y).occupied!=null){
      let tile = currentPlayer().getTile();
      var angle = Math.atan2(this.Y - tile.Y, this.X - tile.X) * (180 / Math.PI);
      if( 314<angle || angle<46 ) y++
      else if(angle<134)x++
      else if(angle<226)y--
      else if(angle<314)x--
      else console.error("Pas possible de creer le mouvement")
    }

  }
  
  execute(){
    if(!this.canExecute()) return null;
    if(canMoveTo(this.player.getTile(),getTile(this.X,this.Y))){
      getTile(this.X,this.Y).occupiedBy(this.player);
      actionDone();
    }else console.log("impossible")


  }
}

class Wall extends Action{
  /**
   * 
   * @param {Player} player
   * @param {Number} x 
   * @param {Number} y 
   * @param {Direction} direction 
   */
  constructor(player,x,y,direction){
    super(player)
    this.X = x;
    this.Y = y;
    this.direction = direction;
  }
  execute(){
    if(!this.canExecute())return null;
    let x = this.X;
    let y = this.Y;
    switch(this.direction) {
      case Direction.Up:
        y++;
        this.direction = Direction.Down;
      case Direction.Down:
        getTile(x, y).BorderD.buildWall(this.player);
        getTile(x, y).Edge.buildWall(this.player);
        getTile(x + 1, y).BorderD.buildWall(this.player);
        break;
      case Direction.Left:
        x--;
        direction = Direction.Right;
      case Direction.Right:
        getTile(x, y).BorderR.buildWall(this.player);
        getTile(x, y + 1).Edge.buildWall(this.player);
        getTile(x, y + 1).BorderR.buildWall(this.player);
        break;


    }
    actionDone();
    
  }
}

Board = [];
const numActions = 2;
const travelDist =1
let remainingAction = numActions;
let boardLength = 0;
let boardHeight = 0;
let turnNb = 0;
playerList = [];
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

/**
 * 
 * @param {Tile} from 
 * @param {Tile} to 
 */
function canMoveTo(from,to){
  if(from==null || to ==null) {console.error("tiles not found");return false;}
  let dist = Math.abs(from.X-to.X) + Math.abs(from.Y-to.Y);
  if(dist==0 || dist>travelDist) return false;
  let border = wallBetween(from,to)
  console.log(border)
  if(border==null) {console.error("border not found"); return false;}
  return !border.wall;
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
  playerList[0] = new Player(-1,Direction.Down);
  playerList[1] = new Player(1,Direction.Up);
  getTile(Math.round(boardLength/2)-1,0).occupiedBy(playerList[0]);
  getTile(Math.round(boardLength/2+0.5)-1,boardHeight-1).occupiedBy(playerList[1]);


}

function GameWinner(){
  playerList.forEach(player => {
    switch(player.startSide){
      case Direction.Up:
        if(player.OnTile.Y==0)return player;
        break;
      case Direction.Down:
        if(player.OnTile.Y==boardHeight-1)return player;
        break;
    }
  });
  return null;
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
 * @param {Player} player player
 * @return {{X:Number,Y:Number}} coords of the tile
 */
function getPlayerPos(player) {
  let tile = player.OnTile;
  return { X: tile.X, Y: tile.Y };
}
/**
 * 
 * @returns {Player} player that must play
 */
function currentPlayer(){
  return playerList[turnNb%2];
}

function actionDone(){
  remainingAction--;
  

  if(remainingAction<=0){
    remainingAction=numActions;
    turnNb++;
  }
  
  if(GameWinner()!=null) alert(GameWinner().modifier+" won");
  let playeTurn = document.getElementById("playerplaying");
  let player = currentPlayer();
  playeTurn.innerHTML = player.modifier;
  for(let y=0;y<boardHeight;y++) for (let x = 0; x<boardLength; x++){
    let tile = getTile(x,y);
    if(tile.visibility * player.modifier>=0) tile.element.style.visibility="visible";
    else if(Math.abs(tile.X-player.OnTile.X) + Math.abs(tile.Y-player.OnTile.Y) <= 1) tile.element.style.visibility="visible";
    else tile.element.style.visibility = "hidden";
  }

}

/**
 * 
 * @param {Tile} from 
 * @param {Tile} to 
 * @returns {Boolean} if possible
 */
function FindPath(from,to){
  tabDone = []
  tabOk = [from]
  
   
}