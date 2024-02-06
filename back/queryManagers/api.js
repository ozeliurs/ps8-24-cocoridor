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
        case 'updateBord':
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

