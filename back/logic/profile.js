const db = require("../database/database.js")
const apiQuery = require("../queryManagers/api.js")

class PlayerAccount {

    static Bot(difficulty = 1){
      let bot = new PlayerAccount()
      bot.username = "Terminator"
      bot.skins = {
          color : null,
          wallColor : null,
          humanSkin : ImageRef.Fermier,
          beastSkin : ImageRef.Poulet,
          wallSkin : "",
          humanSkins : [ImageRef.Fermier],
          beastSkins : [ImageRef.Poulet],
          wallSkins : []
      }
      bot.difficulty = difficulty
      bot.fakePlayer = true
      return bot;
    }

    static Guest(){
        let guest = new PlayerAccount()
        guest.username = "Guest"
        guest.skins = {
            color : null,
            wallColor : null,
            humanSkin : ImageRef.Fermier2,
            beastSkin : ImageRef.Poulet2,
            wallSkin : "",
            humanSkins : [ImageRef.Fermier2],
            beastSkins : [ImageRef.Poulet2],
            wallSkins : []
        }
        guest.fakePlayer = true
        return guest;
    }
    
    static createUser(email,username,password) {
        let user = {
            email : email,
            password : password,
            username : username,
            friends : {
                request:[],
                list:[]
            },
            achievements : [],
            savedGames : [],
            skins : {
                color : null,
                wallColor : null,
                humanSkin : ImageRef.Fermier,
                beastSkin : ImageRef.Poulet,
                wallSkin : "",
                humanSkins : [ImageRef.Fermier,ImageRef.Fermier2],
                beastSkins : [ImageRef.Poulet,ImageRef.Poulet2],
                wallSkins : []
            },
            stats : {
                elo : 1000,
                OnlinePlay : 0,
                OnlinePlayVictory : 0,
                
                LocalPlay : 0,
                
                AiPlay : 0,
                AiPlayVictory : 0,

                FriendPlay : 0,
                FriendPlayVictory : 0,
            },
            convs : {
                new : [],
                all : []
            }

        }
        return db.createUser(user);
    }

    static retrieveUser(accountId){
        db.getUser(accountId).then( (data) => {
            return new PlayerAccount(data);
        })
    }
/**
 * 
 * @param {{id:Number, email:String, password:String, username:String, friends:{list:Number[],request:Number[]},achievements:Any[],savedGames:Number,skins:{color:Color,wallColor:Any,humanSkin:ImageRef,beastSkin:ImageRef,wallSkin:ImageRef,humanSkins:ImageRef[],beastSkins:ImageRef[],wallSkins:ImageRef[]},stats:{elo:Number,OnlinePlay:Number,OnlinePlayVictory:Number,AiPlay:Number,AiPlayVictory:Number,FriendPlay:Number,FriendPlayVictory:Number,LocalPlay:Number}}} datas 
 */
    constructor(datas = null){
        if(datas==null){
            return;
        }
        this.email = datas.email,
        this.password = datas.password,
        this.username = datas.username,
        this.friends = datas.friends,
        this.achievements = datas.achievements,
        this.savedGames = datas.savedGames,
        this.skins = datas.skins,
        this.stats = datas.stats
    }
    /**
     * 
     * @param {String} friendId 
     * @returns 
     */
    addFriend(friendId){
        return db.addFriend(this.username, friendId)
    }
    friendsRequest(friendId){
        if(this.friends.request.includes(friendId)) return db.addFriend(this.username, friendId)
        return db.addFriendRequest(this.username,friendId)
    }
    /**
     * 
     * @param {Achievements} achievement 
     */
    async addAchievements(achievement){
        if(Achievements[achievement]!=null || this.achievements.includes(achievement))return false;
        if(await apiQuery.addAchievement(this.username,achievement))return false;
        this.achievements.push(achievement)
        return true;
    }

    getAchievement(achievement = null){
        if(achievement==null){
            if(this.achievements ==null) return [];
            return this.achievements
        }else{
            return this.achievements.includes(achievement)
        }

    }

}

  class Color{

    static black = new Color(0  ,0  ,0  );
    static red   = new Color(255,0  ,0  );
    static green = new Color(0  ,255,0  );
    static blue  = new Color(0  ,0  ,255);
    static white = new Color(255,255,255);
    static darkGrey = new Color(50,50,50);
    
      constructor(r,g,b){
        this.R = r;
        this.G = g;
        this.B = b;
      }
    
      /**
       * 
       * @param {Color} c 
       * @returns 
       */
      moy(c,per=0.5){
        let r = this.R;
        let g = this.G;
        let b = this.B;
        return new Color((c.R*(1-per)+r*per)/2,(c.G*(1-per)+g*per)/2,(c.B*(1-per)+b*per)/2)
      }
    
      toStyle(){
        return "rgb("+this.R+","+this.G+","+this.B+")"
      }
}
const ImageRef = {
    Fermier : "/assets/img/FermierJ2.png",
    Poulet : "/assets/img/PouletJ1.png",
    Fermier2 : "/assets/img/Fermier2.webp",
    Poulet2 : "/assets/img/Poulet2.png",
    MatchMakingGif : "/assets/img/polos.gif"
}
const Achievements = {
    // Friends
    newFriend : "Avoir un amis",
    FiveFriends : "Avoir 5 amis",
    TenFriends : "Avoir 10 amis",
    
    // Features
    RetrieveGame : "Reprendre une partie",
    SendMessage : "Envoyer un message a un amis",

    // General Games
    OneGame : "Faire votre premiere partie",
    TenGames : "Faire 10 parties",
    FiftyGames : "Faire 50 parties",
    TwoHundredFiftyGames : "Faire 250 parties",
    OneThousandGames : "Faire 1000 parties",
    

    // Ai Play
    AiGamePlayed : "Jouer une partie contre une IA",
    AiGameFive : "Jouer 5 parties contre une IA",
    AiGameTwentyFive : "Jouer 25 parties contre une IA",

    // Friend Play
    FriendGamePlayed : "Jouer une partie contre un amis",
    FriendGameFive : "Jouer 5 partie contre un amis",
    FriendGameTwentyFive : "Jouer 25 partie contre un amis",

    // Online Play
    OnlineGamePlayed : "Jouer une partie classé",
    OnlineGameTen : "Jouer 10 parties classé",
    OnlineGameHundred : "Jouer 100 parties classé",

    // ELO
    EloOneTOneH: "Atteindre 1100 de Elo",
    EloOneTTwoH: "Atteindre 1200 de Elo",
    EloOneTThreeH: "Atteindre 1300 de Elo",
    EloOneTFourH: "Atteindre 1400 de Elo",
    EloOneTFiveH: "Atteindre 1500 de Elo",

    // In-Game
    BerlinWall : "Essayer d'enfermer le joueur adverse",
    JumpOverPlayer : "Sauter au dessus du joueur adverse"
}

/**
 * 
 * @param {PlayerAccount} user 
 */
async function checkStatsAchievement(userId){
    let user = await db.getUser(userId);
    switch(user.stats.AiPlay){
        case 25:
             user.addAchievements(Achievements.AiGameTwentyFive)
        case 5:            
             user.addAchievements(Achievements.AiGameFive)
        case 1:
             user.addAchievements(Achievements.AiGamePlayed)
            break;
    }
    switch(user.stats.FriendPlay){
        case 25:
             user.addAchievements(Achievements.FriendGameTwentyFive)
        case 5:            
             user.addAchievements(Achievements.FriendGameFive)
        case 1:
             user.addAchievements(Achievements.FriendGamePlayed)
            break;
    }
    switch(user.stats.OnlinePlay){
        case 100:
             user.addAchievements(Achievements.OnlineGameHundred)
        case 10:
             user.addAchievements(Achievements.OnlineGameTen)
        case 1:
             user.addAchievements(Achievements.OnlineGamePlayed)
            break;
    }
    switch(user.stats.AiPlay  + user.stats.FriendPlay + user.stats.LocalPlay + user.stats.OnlinePlay){
        case 1000:
             user.addAchievements(Achievements.OneThousandGames)
        case 250:
             user.addAchievements(Achievements.TwoHundredFiftyGames)
        case 50:
             user.addAchievements(Achievements.FiftyGames)
        case 10:
             user.addAchievements(Achievements.TenGames)
        case 1:
             user.addAchievements(Achievements.OneGame)
            break;
    }
    switch(user.stats.elo){
        case 1500:
             user.addAchievements(Achievements.EloOneTFiveH)
        case 1400:
             user.addAchievements(Achievements.EloOneTFourH)
        case 1300:
             user.addAchievements(Achievements.EloOneTThreeH)
        case 1200:
             user.addAchievements(Achievements.EloOneTTwoH)
        case 1100:
             user.addAchievements(Achievements.EloOneTOneH)
            break;
    }
    switch(user.friends.list.length){
        case 10:
             user.addAchievements(Achievements.TenFriends)
        case 5:
             user.addAchievements(Achievements.FiveFriends)
        case 1:
             user.addAchievements(Achievements.newFriend)
            break;
    }
    console.log(user)
}

exports.Achievements = Achievements;
exports.checkStatsAchievement = checkStatsAchievement;
exports.PlayerAccount = PlayerAccount;
exports.Color = Color;