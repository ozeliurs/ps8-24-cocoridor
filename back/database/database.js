const { MongoClient } = require('mongodb');
const {DB_MONGO} = require("../Env.js");
const MONGO_URL = DB_MONGO;
const client = new MongoClient(MONGO_URL);
const { ObjectId } = require('mongodb');


async function getMongoDatabase() {
    if (!!client && !!client.topology && client.topology.isConnected()) {
        await client.connect();
    }
    return client.db('chess');
}
async function clearDatabase() {
    const db = await getMongoDatabase();
    await db.collection('users').deleteMany({});
    await db.collection('games').deleteMany({});
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

async function getGames(playerId){
    const db = await getMongoDatabase();
    return db.collection('games').find({idUser: playerId}).toArray();

}

async function getGame(gameId) {
    const db = await getMongoDatabase();
    //transformer gameId en ObjectId
    let objId = new ObjectId(gameId);
    return db.collection('games').find({ _id: objId }).toArray();
}

async function createGame(game) {
    const db = await getMongoDatabase();
    return await db.collection('games').insertOne(game);
}

async function updateGame(game,gameID){
    const db = await getMongoDatabase();
    let objId= new ObjectId(gameID);
    return await db.collection('games').updateOne({_id: objId},{ $set: game});
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