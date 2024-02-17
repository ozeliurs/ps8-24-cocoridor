// yourTeam.js


exports.setup = async function setup(AIplay) {
    if (AIplay === 2) {
        return Promise.resolve("99");
    } else {
        return Promise.resolve("11");
    }
};

exports.nextMove = async function nextMove(gameState) {

    //currentPosition is the position where you find a 1 in gamesState.board
    let currentPosition;
    for(let i = 0; i < gameState.board.length; i++){
        for(let j = 0; j < gameState.board[i].length; j++){
            if(gameState.board[i][j] === 1){
                currentPosition = (i+1)*10+j+1;
            }
        }
    }
    console.log(currentPosition)
    let nextPosition = currentPosition - 1;
    let wallAtNextPosition = gameState.opponentWalls.find(wall => wall[0] === currentPosition && wall[1] === 0);
    
    if (!wallAtNextPosition && nextPosition >= 1) {
        return Promise.resolve({ action: "move", value: nextPosition.toString() });
    } else {
        return Promise.resolve({ action: "idle" });
    }
};


exports.correction = async function correction(rightMove) {

    return Promise.resolve(true);
};


exports.updateBoard = async function updateBoard(gameState) {
    return Promise.resolve(true);
};