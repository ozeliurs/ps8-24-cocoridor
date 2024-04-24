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
        return guest;
    }
/**
 * 
 * @param {{id:Number, email:String, password:String, username:String, friends:{list:Number[],request:Number[]},achievements:Any[],savedGames:Number,skins:{color:Color,wallColor:Any,humanSkin:ImageRef,beastSkin:ImageRef,wallSkin:ImageRef,humanSkins:ImageRef[],beastSkins:ImageRef[],wallSkins:ImageRef[]}}} datas 
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
    toJson(){
        return {
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
    Fermier2 : "/assets/img/Fermier2.webp",
    Poulet2 : "/assets/img/Poulet2.png",
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