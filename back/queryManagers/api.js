// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

const db = require("../database/database")

async function manageRequest(request, response) {
    // Ici, nous extrayons la partie de l'URL qui indique l'endpoint
    let url = new URL(
        request.url,
        `https://0.0.0.0:${ 8000}`
    );
    let endpoint = url.pathname.split('/')[2]; // Supposant que l'URL est sous la forme /api/endpoint

    switch (endpoint) {
        case 'clear':
            await db.clearDatabase();
            break;
        case 'signup':
            await signup(request, response);
            break;
        case 'signIn':
            await login(request, response);
            break;
        case 'savegame':
            await uploadGame(request, response);
            break;
        case 'retrievegame':
            await retrieveGame(request, response);
            break;
        case 'retrieveUserGames':
            await retrieveUserGames(request, response);
            break;

        default:
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Endpoint non trouvé' }));
    }
}

function parsejson(request) {
    return new Promise((resolve) => {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', () => {
            resolve(JSON.parse(body));
        });
    });
}

async function createOrUpdateUser(email, username, password, response, isNewUser) {

    if (isNewUser) {
        const newUser = {
            email: email,
            username: username,
            password: password
        };
        let userCreated = await db.createUser(newUser);
        if (userCreated) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'Utilisateur créé avec succès'}));
        } else {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({error: 'Erreur lors de la création de l\'utilisateur'}));
        }
    } else {

        const updatedUser = {
            email: email,
            username: username,
            password: password
        };
        let userUpdated = await db.updateUser(updatedUser);
        if (userUpdated) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'Utilisateur mis à jour avec succès'}));
        } else {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({error: 'Erreur lors de la mise à jour de l\'utilisateur'}));
        }
    }
}

async function createGame(idUser, board, turnNb,playerList, response) {
    const NewGame = {
        board: board,
        idUser: idUser,
        turnNb: turnNb,
        playerList: playerList
    };
    let gameCreated = await db.createGame(NewGame);
    if (gameCreated) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(gameCreated.insertedId));
    } else {
        response.writeHead(500, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({error: 'Erreur lors de la création de la partie'}));
    }
}


async function updateGame(idUser, board, turnNb,playerList, gameId, response) {
    console.log("updateGame")
    const updatedGame = {
        board: board,
        idUser: idUser,
        turnNb: turnNb,
        playerList: playerList
    };
    let gameUpdated = await db.updateGame(updatedGame, gameId);
    if (gameUpdated) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Partie mise à jour avec succès' }));
    } else {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Erreur lors de la mise à jour de la partie' }));
    }
}




async function signup(request, response) {

    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }

    parsejson(request).then(async (body) => {
        console.log(body.email+" "+body.username+" "+body.password);
        if (!body.email || !body.username || !body.password) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }
        console.log('username : '+ body.username);
        const users = await db.getUsers();
        const user = await users.findOne({ username: body.username });

        if(user){
            await createOrUpdateUser(
                body.email,
                body.username,
                body.password,
                response,
                false
            );
        }else{
            await createOrUpdateUser(
                body.email,
                body.username,
                body.password,
                response,
                true
            );
        }
    });
}






// Fonction pour gérer la connexion des utilisateurs
async function login(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end',async () => {
        const data = JSON.parse(body);
        const { mail, username, password } = data;
        let test= await db.verifMdp(username,password);
        if(test){
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'connexion succés' }));
        }
    });
}

// Fonction pour enregistrer la partie dans la db
async function uploadGame(request, response) {
    
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));

        return;
    }

    parsejson(request).then(async (body) => {
        if (!body.idUser || !body.board || !body.playerList) {
            
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));

            return;
        }
        if(!body.gameId){

            await createGame(
                body.idUser,
                body.board,
                body.turnNb,
                body.playerList,
                response,
            );
        }else{
            await updateGame(
                body.idUser,
                body.board,
                body.turnNb,
                body.playerList,
                body.gameId,
                response,
            );
        }
    });
}

//Fonction pour récupérer une partie de la db
async function retrieveGame(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }
    parsejson(request).then(async (body) => {
        if(!body.gameId){
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }
        let game=await db.getGame(body.gameId);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(game));
    });

}


async function retrieveUserGames(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }
    parsejson(request).then(async (body) => {
        if(!body.idUser){
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }
        let games=await db.getGames(body.idUser);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(games));
    });
}


/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}

exports.manage = manageRequest;

