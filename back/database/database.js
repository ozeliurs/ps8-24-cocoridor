

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

async function getUser(username) {
    const users = await getUsers();

    return await users.findOne({ username: username });
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
    const user = await db.collection('users').findOne({ username: playerId });
    console.log(user);

    return db.collection('games').find({ _id: { $in: user.savedGames } }).toArray();
}

async function getGame(gameId) {
    const db = await getMongoDatabase();
    let objId = new ObjectId(gameId);
    return await db.collection('games').findOne({ _id: objId });
}

async function createGame(game) {
    const db = await getMongoDatabase();
    return await db.collection('games').insertOne(game);
}

async function addGame(playerId, gameId) {
    console.log("addGame")
    const db = await getMongoDatabase();
    return await db.collection('users').updateOne({username: playerId}, {$push: {savedGames: gameId}});
}


async function updateGame(game,gameID){
    const db = await getMongoDatabase();
    let objId= new ObjectId(gameID);
    return await db.collection('games').updateOne({_id: objId},{ $set: game});
}

async function verifMdp(username, mdp){
    const users = await getUsers();
    return await users.findOne({ username: username, password: mdp })!=null;
    
}

async function addFriendRequest(username, friend){
    const users = await getUsers();
    const user = await users.findOne({ username: friend });
    if(user && !user.friendRequests.includes(username) && !user.friends.includes(username)){
        return await users.updateOne({ username: friend }, { $push: { friendRequests: username } });
    }
    return null;
}

async function getFriendRequests(username){
    const users = await getUsers();
    const user= await users.findOne({ username: username });
    return user.friendRequests;
}

async function addFriend(username, usernameFriend) {
    const users = await getUsers();
    await users.updateOne(
        { username: username },
        {
            $push: { friends: usernameFriend },
            $pull: { friendRequests: usernameFriend },
            $addToSet: {
                conv: { username: usernameFriend, messages: [] },
                convNew: { username: usernameFriend, messages: [] }
            }
        }
    );
    await users.updateOne(
        { username: usernameFriend },
        {
            $push: { friends: username },
            $pull: { friendRequests: username },
            $addToSet: {
                conv: { username: username, messages: [] },
                convNew: { username: username, messages: [] }
            }
        }
    );
    return;
}

async function getFriends(username){
    const users = await getUsers();
    const user=await users.findOne({ username: username })
    return user.friends ;
}

async function getConvN(username){
    const users = await getUsers();
    const user=await users.findOne({ username: username })
    return user.convNew ;
}

async function addMessage(username,friend,message){
    const users = await getUsers();
    console.log("username : ", username, " friend : ", friend, " message : ", message);
    console.log(await users.findOne())
    await users.updateOne(
        { username: username, "conv.username": friend },
        { 
            $push: { "conv.$.messages": username+"/"+message } 
        }
    );
    await users.updateOne(
        { username: friend, "conv.username": username },
        { 
            $push: { "conv.$.messages": username+"/"+message } ,
        }
    );
    await users.updateOne(
        { username: friend, "convNew.username": username },
        { 
            $push: { "convNew.$.messages": message } 
        }
    );
}


async function getConv(username,friend){
    const users = await getUsers();
    const user=await users.findOne({ username: username });
    const friendConv = user.conv.find(conv => conv.username === friend);
    return friendConv.messages;
}

async function getNewConv(username,friend){
    const users = await getUsers();
    const user=await users.findOne({ username: username });
    const newConv = user.convNew.find(convNew => convNew.username === friend);
    await users.updateOne({ username: username, "convNew.username": friend }, { $set: { "convNew.$.messages": [] } });
    return newConv.messages;
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
exports.addFriendRequest = addFriendRequest;
exports.getFriendRequests = getFriendRequests;
exports.addFriend = addFriend;
exports.getFriends = getFriends;
exports. addMessage = addMessage;
exports.getConv = getConv;
exports.getNewConv = getNewConv;
exports.getConvN = getConvN;
exports.addGame = addGame;
