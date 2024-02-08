// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {
    // Ici, nous extrayons la partie de l'URL qui indique l'endpoint
    let url = new URL(
        request.url,
        `https://0.0.0.0:${ 8000}`
    );
    let endpoint = url.pathname.split('/')[2]; // Supposant que l'URL est sous la forme /api/endpoint

    switch (endpoint) {
        case 'signup':
           signup(request, response);
            break;
        case 'login':
           login(request, response);
            break;
        case 'game':
            updateBoard(request, response);
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

function createOrUpdateUser(email, username, password, response, isNewUser) {
    // Vérifier si l'utilisateur existe déjà dans la base de données
    // Si isNewUser est vrai, cela signifie que c'est un nouvel utilisateur à créer

    if (isNewUser) {
        // Si c'est un nouvel utilisateur, insérez-le dans la base de données
        // par exemple, vous pouvez utiliser une requête SQL ou une méthode de votre ORM préférée
        // Ici, nous supposerons une opération réussie pour la démonstration
        // Vous devez remplacer cela par votre propre logique d'insertion en base de données
        // Exemple fictif:
        const newUser = {
            email: email,
            username: username,
            password: password
        };

        // Simuler une opération de succès pour la démonstration
        // Remplacez cette partie par votre propre logique d'insertion en base de données
        const userCreated = true;

        if (userCreated) {
            response.writeHead(201, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Utilisateur créé avec succès' }));
        } else {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Erreur lors de la création de l\'utilisateur' }));
        }
    } else {
        // Si l'utilisateur existe déjà, mettez à jour ses informations dans la base de données
        // par exemple, vous pouvez utiliser une requête SQL ou une méthode de votre ORM préférée
        // Ici, nous supposerons une opération réussie pour la démonstration
        // Vous devez remplacer cela par votre propre logique de mise à jour en base de données
        // Exemple fictif:
        const updatedUser = {
            email: email,
            username: username,
            password: password
        };

        // Simuler une opération de succès pour la démonstration
        // Remplacez cette partie par votre propre logique de mise à jour en base de données
        const userUpdated = true;

        if (userUpdated) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Utilisateur mis à jour avec succès' }));
        } else {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Erreur lors de la mise à jour de l\'utilisateur' }));
        }
    }
}



function signup(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }

    // Get the data from the request body
    parsejson(request).then((body) => {
        // Validate the object
        if (!body.email || !body.username || !body.password) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }

        createOrUpdateUser(
            body.email,
            body.username,
            body.password,
            response,
            true
        );
    });
}






// Fonction pour gérer la connexion des utilisateurs
function login(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        const data = JSON.parse(body);
        const { mail, username, password } = data;

        // Logique de vérification de l'authentification
        // Ici, vous pouvez vérifier si l'utilisateur existe dans la base de données et si le mot de passe est correct
        // Si l'authentification réussit, vous pouvez générer un JWT et le retourner au client
        const token = generateJWT(); // Fonction à implémenter pour générer un JWT

        // Exemple de réponse réussie avec le token JWT
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ token: token }));
    });
}

// Fonction pour démarrer une nouvelle partie
function startGame(request, response) {
    // Logique pour démarrer une nouvelle partie
    // Ici, vous pouvez initialiser le jeu et retourner les données nécessaires au client, par exemple l'identifiant de la partie
    const gameId = initializeGame(); // Fonction à implémenter pour initialiser une nouvelle partie

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

