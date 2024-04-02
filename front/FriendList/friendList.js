document.addEventListener('DOMContentLoaded', async function() {
    const usernameCookie = document.cookie.split('; ').find(row => row.startsWith('nomCookie='));
    if (!usernameCookie) {
        alert("Vous n'êtes pas connecté");
        window.location.href = "../index.html";
        return;
    }

    const nameUser = usernameCookie.split('=')[1];
    console.log("nameUser : ", nameUser);

    await fetch('http://localhost:8000/api/getFriends', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: nameUser })
    })
    .then(response => response.json())
    .then(data => {
        const friends = data.friends;
        const friendRequest = document.getElementById("friendList");
        for (const friend of friends) {
            const friendElement = document.createElement("div");
            friendElement.textContent = friend;
            friendRequest.appendChild(friendElement);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});