

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
    if(currentPlayer()==this.occupied) return;
    let move = new Move(currentPlayer(),this.X,this.Y);
    if(move == undefined)return;
    move.execute();
  }

  generateElement(){
    this.groupElement = document.createElement("div");
    this.groupElement.classList.add("tileGroup");

    this.element = document.createElement("div");
    
    this.element.addEventListener("click", this.onClick.bind(this));
    this.element.classList.add("tile");

    if(this.occupied === false) this.element.style.backgroundColor = Color.darkGrey.toStyle();
    else if (this.occupied === true) {}
    else this.element.style.backgroundColor = this.occupied.color.toStyle();

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
    for(let border of borders) if(border.wallBy!=null) return;
    if(playersCanReachEnd(borders)) new Wall(currentPlayer(),borders).execute(); //TODO server : envoyer le wall au server
    
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
 * @returns {Player} player that must play
 */
function currentPlayer(){
  return playerList[turnNb%playerList.length];
}
/**
 * 
 * @param {TileFront[][]} board 
 */
function DisplayBoard(board){
  currentBoard = board
  let gameDiv = document.getElementById("game");
  while (gameDiv.firstChild) gameDiv.removeChild(gameDiv.firstChild);
  for (const line of board) {
    for (const tile of line) {
      gameDiv.insertBefore(tile.generateElement(),gameDiv.firstChild);
    }
  }
}



