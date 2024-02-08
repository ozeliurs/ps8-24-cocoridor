const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

/*
 ** The MongoClient object is the one that will allow us to connect to the database.
 */
const client = new MongoClient(MONGO_URL);

async function getMongoDatabase() {
    if (!!client && !!client.topology && client.topology.isConnected()) {
        await client.connect();
    }

    return client.db('chess');
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

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.getGame = getGame;
exports.createGame = createGame;
exports.getGames = getGames;