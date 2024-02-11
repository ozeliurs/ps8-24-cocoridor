let boardLength = 11;
let boardHeight = 11;
let playerList = [1,2];
let turnNb = 0;


function init(board,mode) {
    if(mode === "ai"){
        playerList = [1,2];
    }
    else if(mode === "local"){
        playerList = [1,2];
    }
    boardHeight = board.length;
    boardLength = board[0].length;
    turnNb = 0;
}



class Color{

  static black = new Color(0  ,0  ,0  );
  static red   = new Color(255,0  ,0  );
  static green = new Color(0  ,255,0  );
  static blue  = new Color(0  ,0  ,255);
  static white = new Color(255,255,255);
  static darkGrey = new Color(50,50,50);
  
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


class TileFront {
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} maxX
   * @param {Number} minY
   * @param {Player | Boolean} occupiedBy
   */
  constructor(x, y, bRight, bDown, edge, occupiedBy=false) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.occupied = occupiedBy;
    this.right = x != boardLength;
    this.down = y != 0;
    this.BorderR = bRight;
    this.BorderD = bDown;
    this.Edge = edge;

  }

  onClick() {
  //  if(currentPlayer()==this.occupied) return;

    let move = new Move(currentPlayerID(),this.X,this.Y);
    if(move == undefined)return;
    //move.execute();.

    socket.emit("move",move);
    console.log("move")

  }

  generateElement(){
    this.groupElement = document.createElement("div");
    this.groupElement.classList.add("tileGroup");

    this.element = document.createElement("div");
    
    this.element.addEventListener("click", this.onClick.bind(this));
    this.element.classList.add("tile");

    if(this.occupied === false) this.element.style.backgroundColor = Color.darkGrey.toStyle();
    else if (this.occupied === true) {}
    else this.element.style.backgroundColor = new Color(this.occupied.color.R,this.occupied.color.G,this.occupied.color.B).toStyle();

    this.groupElement.appendChild(this.element);

    this.groupElement.appendChild(this.BorderR.generateElement());
    if (!this.right) this.BorderR.element.style.width = 0;
    
    this.groupElement.appendChild(this.BorderD.generateElement());
    if (!this.down) this.BorderD.element.style.width = 0;

    this.groupElement.appendChild(this.Edge.generateElement());
    if (!this.right || !this.down) this.Edge.element.style.width = 0;
    return this.groupElement;
  }


}

class BorderFront{
  constructor(x, y, lng, lat ,color) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.color = color;
    this.lng = lng;
    this.lat = lat;
  }

    /**
     * 
     * @param {Number} lng 
     * @param {Number} lat 
     * @param {Player} player 
     * @returns {Node}
     */
  generateElement() {
    this.element = document.createElement("div");
    switch ((this.lng ? 1 : 0) + (this.lat ? 2 : 0)) {
      case 1: // vertical border
        this.element.classList.add("verticalBorder");
        this.element.addEventListener("click", () => this.onClick(true));
        break;
      case 2: // horizontal border
        this.element.classList.add("horizontalBorder");
        this.element.addEventListener("click", () => this.onClick(false));
        break;
      case 3: // edge
        this.element.classList.add("edge");
        break;
      default: 
        return this.element;
    }
    this.element.style.backgroundColor = this.color
    return this.element

  }
  /**
   * 
   * @param {Boolean} vertical
   */
  onClick(vertical) {
    console.log("onClick")
    
    let wall = new Wall(currentPlayerID(),this.X,this.Y,vertical);
    socket.emit("wall",wall);
    console.log("wall");

    
    
  }

}

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
    

    
    // let start = currentPlayer().getTile();
    // let end = getTile(x,y);
    // let dirs = start.tileInDir(end);
    // let path = aStar({start:start,end:end,maxCost:travelDist});
    // if(path==null) return undefined;
    // while(path.node.occupied!=null){
    //   path = aStar({start,end,maxCost:dirs.length,jumpwall:jumpOverWall});
    //   if(path==null) return undefined;
    //   start = end;
    //   end = path.node.getTileInDir(dirs);
    // }
    // this.X = path.node.X;
    // this.Y = path.node.Y;

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


// Client & Server
// Client
let currentBoard= []

/**
 *
 * @param {Number} x abscisse
 * @param {Number} y ordonnée
 * @returns {Tile} la tuile correspondante ou null.
 */
function getTile(x, y) {
  if(x==null || y==null)return null;
  if(x<0 || x>=boardLength || y<0 || y>=boardHeight) return null;
  return currentBoard[y][x];
}
/**
 * 
 * @returns {Number} player that is playing
 */
function currentPlayerID(){
  return playerList[turnNb%playerList.length];
}
/**
 * 
 * @param {TileFront[][]} board 
 */
function DisplayBoard(board){
  console.log(board) ;
  currentBoard = board
  let gameDiv = document.getElementById("game");
  gameDiv.style.cssText = "display : grid; grid-template-columns: repeat("+boardLength+", max-content); grid-template-rows: repeat("+boardHeight+", max-content);";
  while (gameDiv.firstChild) gameDiv.removeChild(gameDiv.firstChild);
  for (const line of board) {
    for (let tile of line) {
      
      
      tile.BorderD = new BorderFront(tile.BorderD.X,tile.BorderD.Y,false,true,tile.BorderD.color);
      tile.BorderR = new BorderFront(tile.BorderR.X,tile.BorderR.Y,true,false,tile.BorderR.color);
      tile.Edge = new BorderFront(tile.Edge.X,tile.Edge.Y,true,true,tile.Edge.color);
      tile = new TileFront(tile.X,tile.Y,tile.BorderR,tile.BorderD,tile.Edge,tile.occupied);
      gameDiv.insertBefore(tile.generateElement(),gameDiv.firstChild);
    }
  }
}








