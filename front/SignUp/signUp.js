let signUpBtn = document.getElementById('signUp');
let username=document.getElementById('username');
let email=document.getElementById('email');
let mdp=document.getElementById('mdp');
signUpBtn.onclick = function(){

    let user = {
        username: username.value,
        email: email.value,
        password: mdp.value
    }
    
    fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(response => {
        if (response.ok) {
            console.log("test");
            window.location.href = "../";
        } else {
            throw new Error('La requête a échoué'); // Gestion des erreurs
        }
    })

}