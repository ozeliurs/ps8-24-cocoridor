// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

const db = require("../database/database")
const {PlayerAccount, Achievements} = require("../logic/profile")

async function manageRequest(request, response) {
  // Ici, nous extrayons la partie de l'URL qui indique l'endpoint
  let url = new URL(request.url, `https://0.0.0.0:${8000}`);
  let endpoint = url.pathname.split("/")[2]; // Supposant que l'URL est sous la forme /api/endpoint

  switch (endpoint) {
    case "print":
      user = await db.getUsers();
      result = await user.find().toArray();
      break;
    case "printConv":
      user = await db.getUsers();
      result = await user.find().toArray();
      for (const user of result) {
        for (const conv of user.convs.new) {
          console.log("voici le userConvNew : ");
          console.log(conv);
        }
      }

      for (const user of result) {
        for (const conv of user.convs.all) {
          console.log("voici le userConv : ");
          console.log(conv);

        }
      }


      break;
    case "addMessage":
      await addMessage(request, response);
      break;
    case "getConv":
      await getConv(request, response);
      break;
    case "addFriend":
      await addFriend(request, response);
      break;
    case "getFriends":
      await getFriends(request, response);
      break;
    case "getFriendsRequest":
      await sendFriendRequest(request, response);
      break;
    case "getFriends":
      await getFriends(request, response);
      break;
    case "getInfo":
      await getInfo(request, response);
      break;
    case "friendRequest":
      await friendRequest(request, response);
      break;
    case "clear":
      await db.clearDatabase();
      break;
    case "signup":
      await signup(request, response);
      break;
    case "signIn":
      await login(request, response);
      break;
    case "savegame":
      await uploadGame(request, response);
      break;
    case "retrievegame":
      await retrieveGame(request, response);
      break;
    case "retrieveUserGames":
      await retrieveUserGames(request, response);
      break;
    case "changeSkin":
      await changeSkin(request, response);
      break;
    default:
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Endpoint non trouvé" }));
  }
}

function parsejson(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      resolve(JSON.parse(body));
    });
  });
}

async function createOrUpdateUser(email, username, password,response, isNewUser) {

    if (isNewUser) {
        
        const newUser = PlayerAccount.createUser(email,username,password);
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
      password: password,
      friends: [],
      friendRequests: [],
      conv: [],
      convNew: [],
      elo: 1000,
    };
    let userUpdated = await db.updateUser(updatedUser);
    if (userUpdated) {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: "Utilisateur mis à jour avec succès" })
      );
    } else {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          error: "Erreur lors de la mise à jour de l'utilisateur",
        })
      );
    }
  }
}

async function getInfo(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.username) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;
    }

    let user = await db.getUser(body.username);
    let nbMessage=0;
    if (!user) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Utilisateur non trouvé" }));
      return;
    }
    if(user.convs==undefined){
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ elo: user.stats.elo , nbMessage: 0, name: user.username, email: user.email,beastSkins:user.skins.beastSkins,humanSkins:user.skins.humanSkins}));
        return;
    }
    for(const conv of user.convs.new){
      nbMessage += conv.messages.length;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ elo: user.stats.elo , nbMessage: nbMessage, name: user.username, email: user.email,beastSkins:user.skins.beastSkins,humanSkins:user.skins.humanSkins}));
  });

}

async function getUserElo(username) {
  let user = await db.getUser(username);
  if (!user) {
    return null;
  }
  return user.stats.elo;
}

async function updateElo(username, elo) {
    let user = await db.getUser(username);
    user.stats.elo = elo;
    await db.updateUser(user);
    return user.stats.elo;
}

async function updateUserStats(username, stats){
    let user = await db.getUser(username);
    user.stats = stats;
    await db.updateUser(user);
    return user.stats;

}


async function createGame(gameState, response = null) {
    const NewGame = {
        gameState: gameState,
    };
    let gameCreated = await db.createGame(NewGame);
    if(response !== null) {
        if (gameCreated) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(gameCreated.insertedId));
        } else {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({error: 'Erreur lors de la création de la partie'}));
        }
    }
    let playerList = gameState.getPlayerList();
    for(let i=0;i<playerList.length;i++){
        console.log(playerList[i].username+" "+playerList[i].difficulty);
        if(playerList[i].username === undefined || playerList[i].difficulty !== undefined) continue;
        await db.addGame(playerList[i].username,NewGame._id);
    }
    return NewGame._id;
}


async function updateGame(gameState, gameId, response = null) {
    const updatedGame = {
        gameState: gameState
    };
    let gameUpdated = await db.updateGame(updatedGame, gameId);
    if(response !== null) {
        if (gameUpdated) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'Partie mise à jour avec succès'}));
        } else {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({error: 'Erreur lors de la mise à jour de la partie'}));
        }
    }
  
  return updatedGame._id;
}

async function signup(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }


    parsejson(request).then(async (body) => {
        if (!body.email || !body.username || !body.password) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }
        const user = await db.getUser(body.username);

        if(user){
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Nom d\'utilisateur déjà utilisé' }));
            return;
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
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });
  request.on("end", async () => {
    const data = JSON.parse(body);
    const { mail, username, password } = data;
    let test = await db.verifMdp(username, password);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ isConnected: test }));
  });
}

// Fonction pour enregistrer la partie dans la db
async function uploadGame(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));

    return;
  }


    parsejson(request).then(async (body) => {
        if (!body.idUser || !body.gameState) {
            
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));

            return;
        }
        if(!body.gameId){

            await createGame(
                body.idUser,
                body.gameSate,
                response,
            );
        }else{
            await updateGame(
                body.idUser,
                body.gameState,
                body.gameId,
                response,
            );
        }
    });
}

//Fonction pour récupérer une partie de la db
async function retrieveGame(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.gameId) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;
    }
    let game = await getGame(body.gameId);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(game));
  });
}

async function getGame(gameId) {
  let game = await db.getGame(gameId);
  return game;
}

async function retrieveUserGames(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
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
  response.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent to the API.
  response.setHeader("Access-Control-Allow-Credentials", true);
}


async function friendRequest(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.username || !body.friendName) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;

    }
    res = await db.addFriendRequest(body.username, body.friendName);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ result: res }));
  });
}

async function sendFriendRequest(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.username) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;
    }
    let friends = await db.getFriendRequests(body.username);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ friends: friends }));
  });
}

async function addFriend(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.username) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;
    }
    await db.addFriend(body.username, body.friendName);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "connexion succés" }));
  });
}

async function getFriends(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.username) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;
    }
    let friends = await db.getFriends(body.username);
    //vérifier si friends est vide
    if(friends.length==0){
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ nbNewMessage: [] }));
        return;
    }
    let newConv= await db.getConvN(body.username);
    let nbNewMessage=[];
    if(newConv==undefined){
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ nbNewMessage: []}));
        return;
    }
    for(const friend of friends){
        let conv= newConv.find(newConv => newConv.username === friend);
        if(conv==undefined){
            nbNewMessage.push({ friend: friend, nbMessage: 0 });
            continue;
        }
        let nbMessage=conv.messages;
        if(nbMessage==undefined){
            nbNewMessage.push({ friend: friend, nbMessage: 0 });
        }else{
            nbNewMessage.push({ friend: friend, nbMessage: nbMessage.length });
        }
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ nbNewMessage: nbNewMessage}));
  });
}

async function addMessage(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.username || !body.friendName || !body.message) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;
    }
    await db.addMessage(body.username, body.friendName, body.message);
  });
}

async function getConv(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.username || !body.friendName) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Données manquantes" }));
      return;
    }
    let conv = await db.getConv(body.username, body.friendName);
    let newConv= await db.getNewConv(body.username, body.friendName);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ conv: conv ,newConv:newConv}));
  });
}

async function changeSkin(request,response){
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Méthode non autorisée" }));
    return;
  }
  parsejson(request).then(async (body) => {
    if (!body.name || !body.beastSkin || !body.humanSkin) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Données manquantes' }));
      return;
    }
    await db.changeSkin(body.name, body.beastSkin, body.humanSkin);
  });
    
}
/**
 * 
 * @param {String} userId 
 * @returns {Promise<PlayerAccount>}
 */
async function getUser(userId=null){
    if(userId==null) return null;
    return await db.getUser(userId)
}
/**
 * 
 * @param {String} userId 
 * @param {Achievements} achievement 
 * @returns {Promise<Boolean>}
 */
async function addAchievement(userId,achievement){
    if(Achievements[achievement.key]==null) return false;
    let user = await db.getUser(userId)
    if(!user) return false;
    for(achieved of user.achievements)if(achieved.key == achievement.key) return false;
    user.achievements.push(achievement);
    db.updateUser(user);
    return true;
}

async function deleteGameSave(saveId){
    let game =( await db.getGame(saveId)).gameState
    if(game==null)return;
    for(let player of game.gameParams.playerList){
        let user = await getUser(player.username)
        if(user==null) continue;
        delete user.savedGames[saveId]
        db.updateUser(user);
    }

    
}

exports.manage = manageRequest;
exports.createGame = createGame;
exports.updateGame = updateGame;
exports.getGame = getGame;
exports.getUserElo = getUserElo;
exports.updateElo = updateElo;
exports.getUser = getUser;
exports.addAchievement = addAchievement;
exports.deleteGameSave = deleteGameSave;