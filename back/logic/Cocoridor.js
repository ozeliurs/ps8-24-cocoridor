// yourTeam.js


exports.setup = async function setup(AIplay) {
    
    let wall1 = "a1";
    let wall2 = "i1"; 
    
    if (AIplay === 1) {
        return Promise.resolve(wall1 + " " + wall2);
    } else {
        return Promise.resolve(wall2 + " " + wall1);
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