document.addEventListener('DOMContentLoaded', async function() {
    const addFriendForm = document.getElementById('addFriendForm');
    const friendNameInput = document.getElementById('friendName');

    const usernameCookie = document.cookie.split('; ').find(row => row.startsWith('nomCookie='));
    if (!usernameCookie) {
        alert("Vous n'êtes pas connecté");
        window.location.href = "../index.html";
        return;
    }
    const nameUser = usernameCookie.split('=')[1];


    addFriendForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const friendName = friendNameInput.value.trim();
        if(friendName === nameUser) {
            alert("Vous ne pouvez pas vous ajouter en ami");
            return;
        }
        console.log("friendName : ", friendName)
        if (friendName !== '') {
            fetch('http://localhost:8000/api/friendRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: nameUser, friendName: friendName })
            }).then(response => {
                if (response.ok) {
                    alert("Demande envoyée");
                } else {
                    throw new Error('La requête a échoué'); 
                }
            }).catch(error => {
                console.error(error);
            });
            friendNameInput.value = '';
        }
    });

    await fetch('http://localhost:8000/api/getFriendsRequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: nameUser })
    })
    .then(response => response.json())
    .then(data => {
        console.log("data : ", data)
        const friends = data.friends;
        console.log("friends : ", friends);
        const friendRequest = document.getElementById("friendList");
        for (const friend of friends) {
            const friendElement = document.createElement("div");
            friendElement.textContent = friend;
            const addButton = document.createElement("button");
            addButton.textContent = "Ajouter un ami";
            addButton.id = friend;
        
            addButton.addEventListener('click',async function() {
                await fetch('http://localhost:8000/api/addFriend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: nameUser, friendName: this.id})
                })
                window.location.reload();
            });
            friendElement.appendChild(addButton);
            friendRequest.appendChild(friendElement);
        }
    })
    .catch((error) => {
         console.error('Error:', error);
    });
})
