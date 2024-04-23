const db = require("../database/database.js")

class PlayerAccount {

    static Bot(difficulty = 1){
      let bot = new PlayerAccount("bot"+Date.now(),"GAGAGOOGOO")
      bot.difficulty = difficulty
      return bot;
    }
    
    static createUser(username,email,password) {
        let newUser = {
            id : username,
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
                wallColor : null,
                humanSkin : ImageRef.Fermier,
                beastSkin : ImageRef.Poulet,
                wallSkin : "",
                humanSkins : [ImageRef.Fermier],
                beastSkin : [ImageRef.Poulet],
                wallSkins : []
            },
            stats : {
                elo : 1000,
                quickPlayNb : 0,
                quickPlayVictory : 0,
                rankedPlayNb : 0
            }
        }
        return db.createUser(newUser);
    }

    static retrieveUser(accountId){
        db.getUser(accountId).then( (data) => {
            return new PlayerAccount(data);
        })
    }
/**
 * 
 * @param {{id:Number, email:String, password:String, username:String, friends:{list:Number[],request:Number[]},achievements:Any[],savedGames:Number,skins:{wallColor:Any,HumanSkin:ImageRef,BeastSkin:ImageRef,wallSkin:ImageRef,HumanSkins:ImageRef[],BeastSkins:ImageRef[],wallSkins:ImageRef[]}}} datas 
 */
    constructor(datas){
        this.id = datas.id,
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
    toJson(){
        return {
            id : this.id,
            email : this.email,
            password : this.password,
            username : this.username,
            friends : this.friends,
            achievements : this.achievements,
            savedGames : this.savedGames,
            skins : this.skins,
            stats : this.stats
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
    MatchMakingGif : "/assets/img/polos.gif"
}
const Achievements = {
    //Player
    newFriend : "Avoir un amis",
    FiveFriends : "Avoir 5 amis",
    TenFriends : "Avoir 10 amis",
    QuickPlay : "Faire une partie rapide",
    RetrieveGame : "Reprendre une partie",
    TenGames : "Faire 10 parties",
    FiftyGames : "Faire 50 parties",
    SendMessage : "Envoyer un message a un amis",
    PlayAgainstFriend : "Jouer une partie contre un amis",
    PlayRankedGame : "Jouer une partie classé",
    //In-Game

}

exports.Achievements = Achievements;
exports.PlayerAccount = PlayerAccount;
exports.Color = Color;