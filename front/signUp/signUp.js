let signUpBtn = document.getElementById('Inscription');
let username=document.getElementById('username');
let email=document.getElementById('email');
let mdp=document.getElementById('mdp');
signUpBtn.onclick = async function (e) {
    e.preventDefault();


    let user = {
        username: username.value,
        email: email.value,
        password: mdp.value
    }
    let hostname = window.location.hostname;
    let api = "http://"+hostname+":8000/api/signup";
    await fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(response => {
        if (response.ok) {
            alert("Inscription réussie");
            window.location.href = "../index.html";
        } else {
            throw new Error('La requête a échoué'); // Gestion des erreurs
        }

    })
    window.location.href = "../index.html";
}