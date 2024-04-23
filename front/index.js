var btnTab=document.getElementsByClassName('btn')
var badge = document.getElementById('badge')

Array.from(btnTab).forEach(element => {
  var initialElement=element.style;
  element.addEventListener('click', function() {
    element.style.transform="scale(1,1.1)";
    element.style.borderRadius="500px";
    element.style.backgroundColor="yellow";
    setTimeout(function() {
      element.style=initialElement;
    },350);
  });
});

let playerName;
    let cookies =document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split('=');
        if (cookie[0].trim() == 'nomCookie') {
            playerName = cookie[1];
        }
    }

    if(playerName == undefined || playerName == ''){
        document.getElementById('playerName').textContent = 'Player';
    }else{
        document.getElementById('playerName').textContent = playerName;
        let needID = document.getElementsByClassName('needID');
        for (let i = 0; i < needID.length; i++) {
            needID[i].href = needID[i].href.replace('user', playerName);
        }
        let playerRank = 1000;
        document.getElementById('playerRank').textContent = 'Elo ' + playerRank;
        const hostname = window.location.hostname;
        let api = "http://" + hostname + ":8000/api/getElo";
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: playerName})
        })
            .then(response => response.json())
            .then(data => {
                playerRank = data.elo;
                console.log(playerRank);
                if(playerRank == undefined || playerRank == '') {
                    playerRank = 1000;
                }
                document.getElementById('playerRank').textContent = 'Elo ' + playerRank;
                badge.textContent=data.nbMessage;

            })
            .catch(error => {
                console.error('Error:', error);
            });
            
        
    }
