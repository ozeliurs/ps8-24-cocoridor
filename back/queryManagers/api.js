// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

const { getUsers } = require("../database/database");
const { createUser } = require("../database/database");
const { updateUser } = require("../database/database");
const { clearDatabase } = require("../database/database");
const { verifMdp } = require("../database/database");



async function manageRequest(request, response) {
    // Ici, nous extrayons la partie de l'URL qui indique l'endpoint
    let url = new URL(
        request.url,
        `https://0.0.0.0:${ 8000}`
    );
    let endpoint = url.pathname.split('/')[2]; // Supposant que l'URL est sous la forme /api/endpoint

    switch (endpoint) {
        case 'clear':
            await clearDatabase();
            break;
        case 'signup':
            await signup(request, response);
            break;
        case 'signIn':
            await login(request, response);
            break;
        case 'game':
            startGame(request, response);
            break;
        case 'startGame':
            startGame(request, response);
            break;
        case 'endGame':
            endGame(request, response);
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
        console.log("création")
        const newUser = {
            email: email,
            username: username,
            password: password
        };
        userCreated= await createUser(newUser);
        if (userCreated) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Utilisateur créé avec succès' }));
        } else {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Erreur lors de la création de l\'utilisateur' }));
        }
    } else {
        console.log("update")

        const updatedUser = {
            email: email,
            username: username,
            password: password
        };
        userUpdated= await updateUser(updatedUser);
        if (userUpdated) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Utilisateur mis à jour avec succès' }));
        } else {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Erreur lors de la mise à jour de l\'utilisateur' }));
        }
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
        const users = await getUsers();
        console.log(await users.find({}).toArray());
        const user = await users.findOne({ username: body.username });
        console.log(user);

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
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end',async () => {
        const data = JSON.parse(body);
        const { mail, username, password } = data;
        let test= await verifMdp(username,password);
        if(test){
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'connexion succés' }));
        }else{
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Authentification échouée' }));
        }
    });
}

// Fonction pour démarrer une nouvelle partie
function startGame(request, response) {

    // Logique pour démarrer une nouvelle partie
    // Ici, vous pouvez initialiser le jeu et retourner les données nécessaires au client, par exemple l'identifiant de la partie
    const gameId = initializeGame = () => {
        return '123456'; // Exemple d'identifiant de partie
    }
     
     // Fonction à implémenter pour initialiser une nouvelle partie

    // Exemple de réponse réussie avec l'identifiant de la partie
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ gameId: gameId }));
}

// Fonction pour terminer une partie
function endGame(request, response) {
    // Logique pour terminer une partie
    // Ici, vous pouvez mettre à jour les statistiques du joueur, nettoyer les données de la partie, etc.

    // Exemple de réponse réussie
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Game ended successfully' }));
}

// Fonction pour mettre à jour le tableau de jeu
function updateBoard(request, response) {
    // Logique pour mettre à jour le tableau de jeu
    // Ici, vous pouvez recevoir les mouvements des joueurs et mettre à jour l'état du jeu en conséquence

    // Exemple de réponse réussie
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Board updated successfully' }));
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

