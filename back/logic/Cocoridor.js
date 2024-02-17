// yourTeam.js

let PreviousGameState = null;
let EnnemyPos = null;


exports.setup = async function setup(AIplay) {
    if (AIplay === 2) {
        return Promise.resolve("99");
    } else {
        return Promise.resolve("11");
    }
};

exports.nextMove = async function nextMove(gameState) {
    console.log("EnnemyPos : " + EnnemyPos);
    console.log("PreviousGameState : " + PreviousGameState);    
    
    
    findEnnemy(gameState);
    console.log("pos : " + EnnemyPos);
    //currentPosition is the position where you find a 1 in gamesState.board
    let currentPosition;
    for(let i = 0; i < gameState.board.length; i++){
        for(let j = 0; j < gameState.board[i].length; j++){
            if(gameState.board[i][j] === 1){
                currentPosition = (i+1)*10+j+1;
            }
        }
    }
    
    
    let nextPosition = currentPosition - 1;
    let wallAtNextPosition = gameState.opponentWalls.find(wall => wall[0] === currentPosition && wall[1] === 0);
    
    PreviousGameState = gameState;
    if (!wallAtNextPosition && nextPosition >= 1) {
        
        return Promise.resolve({ action: "move", value: nextPosition.toString() });
    } else {

        return Promise.resolve({ action: "wall", value: ["54",1]});
    }
    
};


exports.correction = async function correction(rightMove) {

    return Promise.resolve(true);
};


exports.updateBoard = async function updateBoard(gameState) {
    return Promise.resolve(true);
};


function findEnnemy(gamestate) {

    if(PreviousGameState === null){
        return;
    }

    if(PreviousGameState.opponentWalls.length!== gamestate.opponentWalls.length ){
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

            for (i in range ( possiblepos.length-1)){
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
