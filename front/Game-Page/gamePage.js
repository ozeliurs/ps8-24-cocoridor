class Player {
  constructor(num,startSide) {
    this.num = num;
    this.side = startSide;
    this.OnTile = null;
    switch (num) {
      case 0:
        this.image = "./image1.png";
        this.Color = "rgb(0, 0, 255);"
        break;

      case 1:
        this.image = "./image2.png";
        this.Color = "rgb(255, 0, 0);"
        break;

      case 2:
        this.image = "./image3.png";
        break;
      default:
        break;
    }
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

    if(y<boardHeight/2) this.visibility = -1;
    else if(y==(boardHeight/2)+0.5) this.visibility = 0;
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
  occupiedBy(player) {
    if(player==null) this.occupied = player;
    else{
      if(player.OnTile != null) player.OnTile.occupiedBy(null);
      this.occupied = player;
      player.OnTile = this;
  
    } 
    this.updateTile()
  }

  onClick() {
    actionIsValid(currentPlayer(),new Action(ActionType.MovePlayer,this.X,this.Y));
  }
  updateTile() {
    if (this.occupied != null) {
      this.element.style="background-color:"+this.occupied.Color;
    } else {
      this.element.style=""
    }
  }
}
class Border {
  constructor(x, y, lng, lat) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.wall = false;
    this.generateElement(lng, lat);
  }
  generateElement(lng, lat) {
    this.element = document.createElement("div");
    switch ((lng ? 1 : 0) + (lat ? 2 : 0)) {
      case 1: // horizontal border
        this.element.classList.add("verticalBorder");
        this.element.addEventListener("click", () => this.onClick(new Action(ActionType.WallVertical,this.X,this.Y)));
        break;
      case 2: // vertical border
        this.element.classList.add("horizontalBorder");
        this.element.addEventListener("click", () => this.onClick(new Action(ActionType.WallHorizontal,this.X,this.Y)));
        break;
      case 3: // edge
        this.element.classList.add("edge");
        break;
    }
  }
  buildWall(player) {
    this.element.classList.add("wall");
    this.wall = true;
  }

  onClick(action) {
    actionIsValid(currentPlayer(),action)
  }
}

class Action {
  /**
   *
   * @param {ActionType} ActionType Type d'action qui est effectue
   * @param {Number} x abscisse de la position de l'action
   * @param {Number} y ordonnée de la position de l'action
   */
  constructor(ActionType, x, y) {
    this.actionType = ActionType;
    this.X = x;
    this.Y = y;
  }
}
const ActionType = {
  WallVertical: "verticalWall",
  WallHorizontal: "horizontalWall",
  MovePlayer: "movePlayer",
};

Board = [];
const numActions = 1;
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
  return Board[y][x];
}

function screenTurn(player) {}

/**
 * Verify if the action is legal
 * @param {Player} player player qui compte effectue l'action
 * @param {Action} action action que le joueur veut effectuer
 */
function actionIsValid(player, action) {
  let x = action.X;
  let y = action.Y;
  function spaceAvailable(action) {
    if (action.ActionType == ActionType.WallVertical) y = y++;
    borderUp = getTile(x, y).BorderR.wall;
    borderDown = getTile(x, y - 1).BorderR.wall;
    borderLeft = getTile(x, y).BorderD.wall;
    borderRight = getTile(x + 1, y).BorderD.wall;
    if (action.ActionType == ActionType.WallVertical)
      return !((borderLeft && borderRight) || borderDown || borderUp);
    else return !(borderLeft || borderRight || (borderDown && borderUp));
  }
  switch (action.actionType) {
    case ActionType.MovePlayer:
      if(canMoveTo(getPlayerPos(currentPlayer()), getTile(action.X,action.Y))) move(player,action.X,action.Y);

        
      break;
    case ActionType.WallVertical:
    case ActionType.WallHorizontal:
      if (spaceAvailable(action)) createWall(action);
      break;
  }
}
/**
 * 
 * @param {Tile} from 
 * @param {Tile} to 
 */
function canMoveTo(from,to){
  if(from.X == to.X && Math.abs(from.Y-to.Y)==1){
    if(from.Y>to.Y) return !getTile(from.X,from.Y).BorderD.wall;
    else return !getTile(to.X,to.Y).BorderD.wall;
  }else if(Math.abs(from.X-to.X)==1 && from.Y == to.Y){
    if(from.X<to.X) return !getTile(from.X,from.Y).BorderR.wall;
    else return !getTile(to.X,to.Y).BorderR.wall;
  }
  return null;
}
/**
 * Move the player on the board
 * @param {Player} player
 * @param {Number} x
 * @param {Number} y
 */
function move(player, x, y) {
  getTile(x, y).occupiedBy(player);
  actionDone();
}
/**
 * 
 * @param {Action} action 
 */
function createWall(action) {
  x = action.X;
  y = action.Y;
  switch (action.actionType) {
    case ActionType.WallHorizontal:
      getTile(x, y).BorderD.buildWall();
      getTile(x, y).Edge.buildWall();
      getTile(x + 1, y).BorderD.buildWall();
      break;

    case ActionType.WallVertical:
      getTile(x, y).BorderR.buildWall();
      getTile(x, y + 1).Edge.buildWall();
      getTile(x, y + 1).BorderR.buildWall();
      break;
  }
  actionDone();
  
}

function init(lng = 9, lat = 9) {
  boardLength = lng;
  boardHeight = lat;
  //CreateBoard
  for (y = boardHeight-1; y >= 0; y--) {
    Board[y] = [];
    for (x = 0; x < boardLength; x++) {
      let elemtCreated = new Tile(x, y, boardLength, boardHeight);

      let gameDiv = document.getElementById("game");
      gameDiv.style.cssText = "display : grid; grid-template-columns: repeat("+boardLength+", max-content); grid-template-rows: repeat("+boardHeight+", max-content);";
      gameDiv.appendChild(elemtCreated.groupElement);
      Board[y][x] = elemtCreated;
    }
  }
  //Place Player
  playerList[0] = new Player(0,Direction.Down);
  playerList[1] = new Player(1,Direction.Up);
  getTile(Math.round(boardLength/2)-1,0).occupiedBy(playerList[0]);
  getTile(Math.round(boardLength/2+0.5)-1,boardHeight-1).occupiedBy(playerList[1]);
  //GameStart();


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
 * @param {Player} player player
 * @return {{X:Number,Y:Number}} coords of the tile
 */
function getPlayerPos(player) {
  let tile = player.OnTile;
  return { X: tile.X, Y: tile.Y };
}

function currentPlayer(){
  return playerList[turnNb%2];
}

function actionDone(){
  remainingAction--;
  

  if(remainingAction<=0){
    remainingAction=numActions;
    turnNb++;
  }
  
  if(player = GameWinner()!=null) alert(player.num+" won");
  let playeTurn = document.getElementById("playerplaying");
  if (turnNb%2==0) playeTurn.innerHTML = "Au tour de Player 1 ...";
  else playeTurn.innerHTML = "Au tour de Player 2 ...";

}
