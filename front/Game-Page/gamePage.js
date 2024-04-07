let boardLength = 9;
let boardHeight = 9;
let playerList = [1,2];
let turnNb = 0;



function init(board,mode, turn) {
    if(mode === "ai"){
        playerList = [1,2];
    }
    else if(mode === "local"){
        playerList = [1,2];
    }
    boardHeight = board.length;
    boardLength = board[0].length;
    turnNb = turn;
}



class Color{

  static black = new Color(0  ,0  ,0  );
  static red   = new Color(255,0  ,0  );
  static green = new Color(0  ,255,0  );
  static blue  = new Color(0  ,0  ,255);
  static white = new Color(255,255,255);
  static darkGrey = new Color(50,50,50);
  static highlight = new Color(100,100,100);
  static grey = new Color(125,125,125);
  static lightgrey = new Color(175,175,175);
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
   * @param {BorderFront} bRight
   * @param {BorderFront} bDown
   * @param {BorderFront} edge
   * @param {Player | Boolean} occupiedBy
   */
  constructor(x, y, bRight, bDown, edge, occupiedBy=false) {
    this.X = Math.floor(x);
    this.Y = Math.floor(y);
    this.occupied = occupiedBy;
    this.right = x != boardLength-1;
    this.down = y != 0;
    this.BorderR = bRight;
    this.BorderD = bDown;
    this.Edge = edge;

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

  onClick() {
    let move = new Move(currentPlayerID(),this.X,this.Y);
    if(move == undefined)return;
    if(mode =="newAi" && gameId==null) socket.emit("gameSetup",move,user)
    else socket.emit("move",move,gameId,user);

  }

  generateElement(){
    this.groupElement = document.createElement("div");
    this.groupElement.classList.add("tileGroup");

    this.element = document.createElement("div");

    this.element.addEventListener("click", this.onClick.bind(this));

    // Debut highlight deplacement
    /*this.element.addEventListener("mouseover", ()=>{
      let tile = getTile(this.X,this.Y)

      let dir = this.tileInDir();
      while(this.occupied!=null){
        tile = tile.getTileInDir(dir)
      }
      this.highlight = tile
      this.highlight.element.style.backgroundColor = Color.highlight.toStyle()
    });
    this.element.addEventListener("mouseout", ()=>{
      if(this.highlight==null)return
      this.highlight.element.style.backgroundColor = ""
    });*/
    this.element.classList.add("tile");

    if(this.occupied === false) this.element.style.backgroundColor = Color.darkGrey.toStyle();
    else if (this.occupied === true) {}
    else {
      let img = document.createElement("img");
      img.src = this.occupied.image; 
      img.style.width = "100%"; 
      img.style.height = "100%";
      this.element.appendChild(img)
    } 

    this.groupElement.appendChild(this.element);

    this.groupElement.appendChild(this.BorderR.generateElement());
    if (!this.right) this.BorderR.element.style.width = 0;

    this.groupElement.appendChild(this.BorderD.generateElement());
    if (!this.down) this.BorderD.element.style.height = 0;

    this.groupElement.appendChild(this.Edge.generateElement());
    if (!this.right || !this.down) {
      this.Edge.element.style.width = 0;
      this.Edge.element.style.height = 0;
    }
    
    return this.groupElement;
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

    /**
     *
     * @param {Number} lng
     * @param {Number} lat
     * @param {Player} player
     * @returns {Node}
     */
  generateElement() {
    this.element = document.createElement("div");
    let tile;
    let nextTile;
    switch ((this.lng ? 1 : 0) + (this.lat ? 2 : 0)) {
      case 1: // vertical border
        this.element.classList.add("verticalBorder");
        this.element.addEventListener("click", () => this.onClick(true));
        
        tile = getTile(this.X,this.Y);
        nextTile = getTile(this.X,this.Y+1);
        this.element.addEventListener("mouseover", () => {
          if(this.element.style.backgroundColor!="" || nextTile==null || nextTile.BorderR.element.style.backgroundColor!="" || nextTile.Edge.element.style.backgroundColor!="") return;
          this.element.style.backgroundColor = Color.highlight.toStyle();
          if(nextTile==null)return;
          nextTile.Edge.element.style.backgroundColor = Color.highlight.toStyle();
          nextTile.BorderR.element.style.backgroundColor = Color.highlight.toStyle();
        });
        this.element.addEventListener("mouseout", () => {
          this.element.style.backgroundColor = this.color
          if(nextTile==null)return;
          nextTile.Edge.element.style.backgroundColor = nextTile.Edge.color
          nextTile.BorderR.element.style.backgroundColor = nextTile.BorderR.color
        });

        break;
      case 2: // horizontal border
        this.element.classList.add("horizontalBorder");
        this.element.addEventListener("click", () => this.onClick(false));

        tile = getTile(this.X,this.Y);
        nextTile = getTile(this.X+1,this.Y);
        this.element.addEventListener("mouseover", () => {
          if(this.element.style.backgroundColor!="" || nextTile==null || nextTile.BorderD.element.style.backgroundColor!="" || tile.Edge.element.style.backgroundColor!="") return;
          this.element.style.backgroundColor = Color.highlight.toStyle();
          if(nextTile==null)return;
          tile.Edge.element.style.backgroundColor = Color.highlight.toStyle();
          nextTile.BorderD.element.style.backgroundColor = Color.highlight.toStyle();
        });
        this.element.addEventListener("mouseout", () => {
          this.element.style.backgroundColor = this.color
          tile.Edge.element.style.backgroundColor = tile.Edge.color
          if(nextTile==null)return;
          nextTile.BorderD.element.style.backgroundColor = nextTile.BorderD.color
        });

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
    let wall = new Wall(currentPlayerID(),this.X,this.Y,vertical);
    socket.emit("wall",wall,gameId,user);

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
 * @returns {TileFront} la tuile correspondante ou null.
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
 * @param {{X:Number,Y:Number}[]} positions
 */
function DisplayBoard(board,positions=null){
  currentBoard = board
  let gameDiv = document.getElementById("game");
  gameDiv.style.cssText = "display : grid; grid-template-columns: repeat("+boardLength+", max-content); grid-template-rows: repeat("+boardHeight+", max-content);";
  while (gameDiv.firstChild) gameDiv.removeChild(gameDiv.firstChild);
  for (let y=boardHeight-1;y>=0;y-- ) {
    for (let tile of board[y]) {

      tile.BorderD = new BorderFront(tile.BorderD.X,tile.BorderD.Y,false,true,tile.BorderD.color, tile.BorderD.playerId);
      tile.BorderR = new BorderFront(tile.BorderR.X,tile.BorderR.Y,true,false,tile.BorderR.color, tile.BorderR.playerId);
      tile.Edge = new BorderFront(tile.Edge.X,tile.Edge.Y,true,true,tile.Edge.color, tile.Edge.playerId);
      tile = new TileFront(tile.X,tile.Y,tile.BorderR,tile.BorderD,tile.Edge,tile.occupied);

      tile.generateElement();
      if(positions!=null) {
        for(co of positions) if(tile.X!=co.X && tile.Y!=co.Y){
          tile.element = tile.element.cloneNode(true);
          tile.element.style.backgroundColor = Color.lightgrey.toStyle();
          break;
        }
          
          while (tile.groupElement.firstChild) tile.groupElement.removeChild(tile.groupElement.firstChild);
          tile.Edge.element = tile.Edge.element.cloneNode(true);
          tile.BorderD.element = tile.BorderD.element.cloneNode(true);
          tile.BorderR.element = tile.BorderR.element.cloneNode(true);

          tile.groupElement.appendChild(tile.element);
          tile.groupElement.appendChild(tile.BorderR.element);
          tile.groupElement.appendChild(tile.BorderD.element);
          tile.groupElement.appendChild(tile.Edge.element);

          tile.Edge.element.style.backgroundColor = Color.darkGrey.toStyle()
          tile.BorderD.element.style.backgroundColor = Color.grey.toStyle()
          tile.BorderR.element.style.backgroundColor = Color.grey.toStyle()
      }
      gameDiv.appendChild(tile.groupElement);
    }
  }
  let playerTurn = document.getElementById("playerTurn");
  playerTurn.innerHTML="";
  let img = document.createElement("img");
  img.style.width = "100%"; 
  img.style.height = "100%";


  if (turnNb % 2 === 0) {
    img.src="../Game-Page/FermierJ2.png"
    playerTurn.appendChild(img) 
    if(turnNb==0){playerTurn.appendChild(document.createTextNode("Veuillez placer votre personnage joueur 1 puis jouez"));}
    else{playerTurn.appendChild(document.createTextNode("Au tour du joueur 1 de jouer"))};
  }
  else {
    img.src = "../Game-Page/PouletJ1.png"
    playerTurn.appendChild(img) 
    if(turnNb==1){playerTurn.appendChild(document.createTextNode("Veuillez placer votre personnage joueur 2 puis jouez"));}
    else{playerTurn.appendChild(document.createTextNode("Au tour du joueur 2 de jouer"));}
  }
  if(mode === "local") {
  
    let gC = document.getElementById("gameCover");
    gC.style.cssText = "display : block; font-size: 50px;  text-align: center; margin:auto; padding-top: 200px;padding-bottom: 400px;";
    gC.innerHTML = "Cliquez pour continuer ...";
  }
}

const chatButtons= document.querySelectorAll(".msgButton");
for(let button of chatButtons){
  button.addEventListener("click",()=>{
    chatInput.value = button.textContent;
    handleChat();
  });
}

const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");

const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; 
}


const handleChat = () => {
    userMessage = chatInput.value.trim();
    if(!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

