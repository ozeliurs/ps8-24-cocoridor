let signInBtn = document.getElementById('connexion');
let username=document.getElementById('username');
let mdp=document.getElementById('mdp');
signInBtn.onclick = async function(e){
    e.preventDefault();
    let user = {
        username: username.value,
        email: " ",
        password: mdp.value
    }

    const hostname = window.location.hostname;
    let api = "http://"+hostname+":8000/api/signIn";
    await fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if(data.isConnected == true){
            let currentDate = new Date();
            let expirationDate = new Date(currentDate.getTime() + (1 * 60 * 60 * 1000)); // Ajouter une heure en millisecondes
            let expiresUTC = expirationDate.toUTCString();
            document.cookie = "nomCookie="+username.value+"; expires=" + expiresUTC + ";";
            window.location.href = "../index.html";
        }else{
            alert("Mauvais identifiants");
            window.location.reload();
        }
    })
    .catch((error) => {
        console.error('Error:', error);

    });
    

} 