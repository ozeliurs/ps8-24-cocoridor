let signInBtn = document.getElementById('signIn');
let username=document.getElementById('username');
let mdp=document.getElementById('mdp');
signInBtn.onclick = async function(e){
    e.preventDefault();
    let user = {
        username: username.value,
        email: " ",
        password: mdp.value
    }



    await fetch('http://localhost:8000/api/signIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        let currentDate = new Date();
        let expirationDate = new Date(currentDate.getTime() + (1 * 60 * 60 * 1000)); // Ajouter une heure en millisecondes
        let expiresUTC = expirationDate.toUTCString();
        document.cookie = "nomCookie="+username.value+"; expires=" + expiresUTC + ";";
        window.location.href = "../index.html";
        alert("Connexion réussie");
    })
    .catch((error) => {
        console.error('Error:', error);

    });

    window.location.href = "../index.html";

} 