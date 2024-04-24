

const { MongoClient } = require('mongodb');
const {DB_MONGO} = require("../Env.js");
const MONGO_URL = DB_MONGO;
const client = new MongoClient(MONGO_URL);
const { ObjectId } = require('mongodb');
const { GameState } = require("../logic/back.js");
const profile = require('../logic/profile.js');
const { addAchievement } = require('../queryManagers/api.js');

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

/**
 * 
 * @param {String} username 
 * @returns {Promise<profile.PlayerAccount>}
 */
async function getUser(username) {
    const users = await getUsers();
    let res = await users.findOne({ username: username })
    if( res ==null )return null
    return new profile.PlayerAccount(res);
}

async function createUser(user) {
    const users = await getUsers();
    return await users.insertOne(user);
}

/**
 * 
 * @param {profile.PlayerAccount} user 
 * @returns {Promise<PlayerAccount>}
 */
async function updateUser(user){
    if(user.fakePlayer) return null;
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

    return db.collection('games').find({ _id: { $in: user.savedGames } }).toArray();
}

/**
 * 
 * @param {*} gameId 
 * @returns {Promise<GameState>}
 */
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
    if(user && !user.friends.request.includes(username) && !user.friends.list.includes(username)){
        user.friends.request.push(username);
        await users.updateOne({ username: friend }, { $set: { friends: user.friends } });
        return {result: "ok"};
    }
    return null;
}

async function getFriendRequests(username){
    const users = await getUsers();
    const user= await users.findOne({ username: username });
    return user.friends.request;
}

async function addFriend(username, usernameFriend) {
    const users = await getUsers();
    const user= await users.findOne({ username: username });
    if(!user.friends.request.includes(usernameFriend)) {
        return;
    }
    user.friends.request = user.friends.request.filter(request => request !== usernameFriend);
    user.friends.list.push(usernameFriend);
    await users.updateOne({ username: username }, { $set: { friends: user.friends } });
    const userFriend = await users.findOne({ username: usernameFriend });
    userFriend.friends.list.push(username);
    userFriend.friends.request = userFriend.friends.request.filter(request => request !== username);
    await users.updateOne({ username: usernameFriend }, { $set: { friends: userFriend.friends } });
    return;
}

async function getFriends(username){
    const users = await getUsers();
    const user=await users.findOne({ username: username })
    return user.friends.list ;
}

async function getConvN(username){
    const users = await getUsers();
    const user=await users.findOne({ username: username })
    return user.convs.new ;
}

async function addMessage(username,friend,message){
    const users = await getUsers();
    const user = await users.findOne({ username: username });
    let conv = user.convs.all.find(conv => conv.username === friend);
    if(conv==null) {
        user.convs.all.push({username: friend, messages: [username + "/" + message]});
    } else {
        conv.messages.push(username + "/" + message);
    }
    await users.updateOne({ username: username }, { $set: { convs: user.convs } });

    const friendUser = await users.findOne({ username: friend });
    let friendConv = friendUser.convs.all.find(conv => conv.username === username);
    let friendConvN = friendUser.convs.new.find(conv => conv.username === username);
    if(friendConv==null) {
        friendUser.convs.all.push({username: username, messages: [username + "/" + message]});
    } else {
        friendConv.messages.push(username + "/" + message);
    }
    if(friendConvN==null) {
        friendUser.convs.new.push({username: username, messages: [username + "/" + message]});
    } else {
        friendConvN.messages.push(username + "/" + message);
    }
    await users.updateOne({ username: friend }, { $set: { convs: friendUser.convs } });
    return;
}


async function getConv(username,friend){
    const users = await getUsers();
    const user=await users.findOne({ username: username });
    let conv = user.convs.all.find(conv => conv.username === friend);
    if(conv==null){
        return [];
    }
    return conv.messages;
}

async function getNewConv(username,friend){
    const users = await getUsers();
    const user=await users.findOne({ username: username });
    let conv = user.convs.new.find(conv => conv.username === friend);
    if(conv==null){
        return [];
    }
    user.convs.new = user.convs.new.filter(conv => conv.username !== friend);
    await users.updateOne({ username : username }, { $set: { convs: user.convs } });
    console.log(conv.messages)
    return conv.messages;
}

async function changeSkin(username, beast, human) {
    const users = await getUsers();
    console.log(username, beast, human)
    await users.updateOne({ username: username }, { $set: { 
        "skins.beastSkin": beast, 
        "skins.humanSkin": human 
    } });
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
exports.changeSkin = changeSkin;
