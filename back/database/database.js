const { MongoClient } = require('mongodb');
const {DB_MONGO} = require("../Env.js");
const MONGO_URL = DB_MONGO;
const client = new MongoClient(MONGO_URL);


async function getMongoDatabase() {
    if (!!client && !!client.topology && client.topology.isConnected()) {
        await client.connect();
    }
    return client.db('chess');
}
async function clearDatabase() {
    const db = await getMongoDatabase();
    await db.collection('users').deleteMany({});
    return; 
}
async function getUsers() {
    const db = await getMongoDatabase();

    return db.collection('users');
}

async function getUser(email) {
    const users = await getUsers();

    return await users.findOne({ email: email });
}

async function createUser(user) {
    const users = await getUsers();
    return await users.insertOne(user);
}

async function updateUser(user){
    const users = await getUsers();

    return await users.updateOne({ username: user.username }, { $set: user });
}

async function getGames() {
    const db = await getMongoDatabase();

    return db.collection('games').find().toArray();
}

async function getGame(gameId) {
    const db = await getMongoDatabase();

    return db.collection('games').findOne({ _id: gameId });
}

async function createGame(game) {
    const db = await getMongoDatabase();

    return await db.collection('games').insertOne(game);
}

async function updateGame(game,gameID){
    const db = await getMongoDatabase();

    return await db.collection('games').updateOne({_id: gameID},{ $set: game});
}

async function verifMdp(username, mdp){
    const users = await getUsers();
    return await users.findOne({ username: username, password: mdp });
    
}

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.getGame = getGame;
exports.createGame = createGame;
exports.getGames = getGames;
exports.updateUser = updateUser;
exports.clearDatabase = clearDatabase;
exports.verifMdp = verifMdp;
exports.updateGame = updateGame;