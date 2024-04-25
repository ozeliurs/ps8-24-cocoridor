const {PlayerAccount} = require("../../../back/logic/profile"); // TODO REDIRECT
const { addAchievement } = require("../../../back/queryManagers/api");

const Achievements = {
    // Friends
    newFriend : "Avoir un amis",
    FiveFriends : "Avoir 5 amis",
    TenFriends : "Avoir 10 amis",
    
    // Features
    RetrieveGame : "Reprendre une partie",
    SendMessage : "Envoyer un message a un amis",
    PlayAgainstFriend : "Jouer une partie contre un amis",

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
    BerlinWall : "Essayer d'enfermer le joueur adverse"
}