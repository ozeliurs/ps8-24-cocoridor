let cptBeast=0;
let cptFarm=0;
document.addEventListener('DOMContentLoaded', async function() {
    let name;
    const imgBeast= document.getElementById('imgBeast');
    const imgFarm= document.getElementById('imgFarm');   
    let cptBeast=0;
    let cptFarm=0;
    let beastSkins;
    let humanSkins;

    const usernameCookie = document.cookie.split('; ').find(row => row.startsWith('nomCookie='));
    if (!usernameCookie) {
        alert("Vous n'êtes pas connecté");
        window.location.href = "../index.html";
        return;
    }
    const nameUser = usernameCookie.split('=')[1];
    const hostname = window.location.hostname;
        let api = "http://" + hostname + ":8000/api/getInfo";
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: nameUser})
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                playerRank = data.elo;
                if(playerRank == undefined || playerRank == '') {
                    playerRank = 1000;
                }
                console.log(data)
                document.getElementById('playerRank').textContent = 'Elo ' + playerRank;
                document.getElementById('name').textContent =data.name;
                name=data.name;
                document.getElementById('email').textContent=data.email;
                beastSkins = data.beastSkins;
                humanSkins = data.humanSkins;
                imgBeast.setAttribute('src', beastSkins[cptBeast]);
                imgFarm.setAttribute('src', humanSkins[cptFarm]);

            })
            .catch(error => {
                console.error('Error:', error);
            });
    
    const BleftArrow=document.getElementById('arrowLBeast');    
    const BRightArrow=document.getElementById('arrowRBeast');
    
    const FleftArrow=document.getElementById('arrowLFarm');    
    const FRightArrow=document.getElementById('arrowRFarm');

    BleftArrow.addEventListener('click', async function() {
       cptBeast=changeImg(cptBeast,beastSkins,imgBeast,BleftArrow,BRightArrow,true)
    });

    FleftArrow.addEventListener('click', async function() {
        cptFarm=changeImg(cptFarm,humanSkins,imgFarm,FleftArrow,FRightArrow,true)
    });


    BRightArrow.addEventListener('click', async function() {
        cptBeast=changeImg(cptBeast,beastSkins,imgBeast,BRightArrow,BleftArrow,false);
    });

    FRightArrow.addEventListener('click', async function() {
        cptFarm=changeImg(cptFarm,humanSkins,imgFarm,FRightArrow,FleftArrow,false);
    });

    const saveButton=document.getElementById('confirm');
    saveButton.addEventListener('click', async function() {
        let obj = {
            name: name,
            beastSkin: beastSkins[cptBeast],
            humanSkin: humanSkins[cptFarm]
        }

        let api = "http://"+hostname+":8000/api/changeSkin";
        await fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        }).then(response => {
            if (response.ok) {
                alert('Modifications enregistrées');
                window.location.reload();
                //renvoie sur la main page
                window.location.href = "../index.html";
            } else {
                throw new Error('La requête a échoué'); // Gestion des erreurs
            }
        })


    });

});

function changeImg(cpt,skins,img,arrow,arrow2,type){
    console.log(cpt)
    if(type){
        cpt--;
        if(cpt==0){
            arrow.style.display='none';
        }
    }else{
        cpt++;
        if(cpt==skins.length-1){
            arrow.style.display='none';
        }
    }

    img.setAttribute('src',skins[cpt]);
    if(arrow2.style.display=='' || arrow2.style.display=='none'){
        arrow2.style.display='block';
    }

    return cpt
}
