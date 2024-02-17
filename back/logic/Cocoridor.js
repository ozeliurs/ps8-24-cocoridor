// yourTeam.js


exports.setup = async function setup(AIplay) {
    


    
    if (AIplay === 1) {
        return Promise.resolve("99");
    } else {
        return Promise.resolve("09");
    }
};

exports.nextMove = async function nextMove(gameState) {

    let currentPosition = gameState.board.find(row => row.includes(1)).indexOf(1) + 1; 
    let nextPosition = currentPosition - 1; 

    let wallAtNextPosition = gameState.opponentWalls.find(wall => wall[0] === String.fromCharCode(nextPosition + 96) + String.fromCharCode(currentPosition + 48));
    
    if (!wallAtNextPosition && nextPosition >= 1) {
        return Promise.resolve({ action: "move", value: String.fromCharCode(nextPosition + 96) + String.fromCharCode(currentPosition + 48) });
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