let signUpBtn = document.getElementById('signUp');
let username=document.getElementById('username');
let email=document.getElementById('email');
let mdp=document.getElementById('mdp');
signUpBtn.onclick = function(){
    let user = {
        name: username.value,
        email: email.value,
        password: mdp.value
    }

    fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = "../";
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}