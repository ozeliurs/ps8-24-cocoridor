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
        this.convs = datas.convs
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
        if(Achievements[achievement.key]==null || this.achievements.includes(achievement)){console.log("false");return false;}
        for(let achieve of this.achievements) if(achieve.key== achievement.key)return false;
        if(await apiQuery.addAchievement(this.username,achievement)){console.log("false2");return false;}
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
    newFriend : {key:"newFriend",value:"Avoir un amis"},
    FiveFriends : {key:"FiveFriends",value:"Avoir 5 amis"},
    TenFriends : {key:"TenFriends",value:"Avoir 10 amis"},
    
    // Features
    RetrieveGame : {key:"RetrieveGame",value:"Reprendre une partie"},
    SendMessage : {key:"SendMessage",value:"Envoyer un message a un amis"},

    // General Games
    OneGame : {key:"OneGame",value:"Faire votre premiere partie"},
    TenGames : {key:"TenGames",value:"Faire 10 parties"},
    FiftyGames : {key:"FiftyGames",value:"Faire 50 parties"},
    TwoHundredFiftyGames : {key:"TwoHundredFiftyGames",value:"Faire 250 parties"},
    OneThousandGames : {key:"OneThousandGames",value:"Faire 1000 parties"},
    

    // Ai Play
    AiGamePlayed : {key:"AiGamePlayed",value:"Jouer une partie contre une IA"},
    AiGameFive : {key:"AiGameFive",value:"Jouer 5 parties contre une IA"},
    AiGameTwentyFive : {key:"AiGameTwentyFive",value:"Jouer 25 parties contre une IA"},

    // Friend Play
    FriendGamePlayed : {key:"FriendGamePlayed",value:"Jouer une partie contre un amis"},
    FriendGameFive : {key:"FriendGameFive",value:"Jouer 5 partie contre un amis"},
    FriendGameTwentyFive : {key:"FriendGameTwentyFive",value:"Jouer 25 partie contre un amis"},

    // Online Play
    OnlineGamePlayed : {key:"OnlineGamePlayed",value:"Jouer une partie classé"},
    OnlineGameTen : {key:"OnlineGameTen",value:"Jouer 10 parties classé"},
    OnlineGameHundred : {key:"OnlineGameHundred",value:"Jouer 100 parties classé"},

    // ELO
    EloOneTOneH: {key:"EloOneTOneH",value:"Atteindre 1100 de Elo"},
    EloOneTTwoH: {key:"EloOneTTwoH",value:"Atteindre 1200 de Elo"},
    EloOneTThreeH: {key:"EloOneTThreeH",value:"Atteindre 1300 de Elo"},
    EloOneTFourH: {key:"EloOneTFourH",value:"Atteindre 1400 de Elo"},
    EloOneTFiveH: {key:"EloOneTFiveH",value:"Atteindre 1500 de Elo"},

    // In-Game
    BerlinWall : {key:"BerlinWall",value:"Essayer d'enfermer le joueur adverse"},
    JumpOverPlayer : {key:"JumpOverPlayer",value:"Sauter au dessus du joueur adverse"}
}

/**
 * 
 * @param {PlayerAccount} user 
 */
async function checkStatsAchievement(user){
    if(user.stats.AiPlay>=25) await user.addAchievements(Achievements.AiGameTwentyFive);
    if(user.stats.AiPlay>= 5) await user.addAchievements(Achievements.AiGameFive);
    if(user.stats.AiPlay>= 1) await user.addAchievements(Achievements.AiGamePlayed);
    
    if(user.stats.FriendPlay >= 25) await user.addAchievements(Achievements.FriendGameTwentyFive);
    if(user.stats.FriendPlay >= 5) await user.addAchievements(Achievements.FriendGameFive);
    if(user.stats.FriendPlay >= 1) await user.addAchievements(Achievements.FriendGamePlayed);
    
    if(user.stats.OnlinePlay >= 100) await user.addAchievements(Achievements.OnlineGameHundred);
    if(user.stats.OnlinePlay >= 10) await user.addAchievements(Achievements.OnlineGameTen);
    if(user.stats.OnlinePlay >= 1) await user.addAchievements(Achievements.OnlineGamePlayed);
    {
        let totalGame = user.stats.AiPlay  + user.stats.FriendPlay + user.stats.LocalPlay + user.stats.OnlinePlay
        let totalVictory = user.stats.AiPlayVictory + user.stats.FriendPlayVictory + user.stats.OnlinePlayVictory

        if(totalGame>= 1000)await user.addAchievements(Achievements.OneThousandGames);
        if(totalGame>= 250)await user.addAchievements(Achievements.TwoHundredFiftyGames);
        if(totalGame>= 50)await user.addAchievements(Achievements.FiftyGames);
        if(totalGame>= 10)await user.addAchievements(Achievements.TenGames);
        if(totalGame>= 1)await user.addAchievements(Achievements.OneGame);
        /*
        if(totalVictory>= 1000)await user.addAchievements(Achievements.OneThousandGames);
        if(totalVictory>= 250)await user.addAchievements(Achievements.TwoHundredFiftyGames);
        if(totalVictory>= 50)await user.addAchievements(Achievements.FiftyGames);
        if(totalVictory>= 10)await user.addAchievements(Achievements.TenGames);
        if(totalVictory>= 1)await user.addAchievements(Achievements.OneGame);
        */
    }
    if(user.stats.elo>= 1500) await user.addAchievements(Achievements.EloOneTFiveH);
    if(user.stats.elo>= 1400) await user.addAchievements(Achievements.EloOneTFourH);
    if(user.stats.elo>= 1300) await user.addAchievements(Achievements.EloOneTThreeH);
    if(user.stats.elo>= 1200) await user.addAchievements(Achievements.EloOneTTwoH);
    if(user.stats.elo>= 1100) await user.addAchievements(Achievements.EloOneTOneH);

    if(user.friends.list.length >= 10) await user.addAchievements(Achievements.TenFriends);
    if(user.friends.list.length >= 5) await user.addAchievements(Achievements.FiveFriends);
    if(user.friends.list.length >= 1) await user.addAchievements(Achievements.newFriend);
}

exports.Achievements = Achievements;
exports.checkStatsAchievement = checkStatsAchievement;
exports.PlayerAccount = PlayerAccount;
exports.Color = Color;