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


            const chatButton = document.createElement("button");
            //chatButton.textContent = "Chat";

            // const spanWithImage = document.createElement("span");
            // spanWithImage.classList.add("material-symbols-rounded");

            const img = document.createElement("img");
            img.setAttribute("src", "../FriendList/chat2.png");
            img.setAttribute("alt", "chat");
            img.style.width = "5%";
            img.style.height = "5%";

            // spanWithImage.appendChild(img);


            // const emptySpan = document.createElement("span");
            // emptySpan.classList.add("material-symbols-outlined");

            // chatButton.appendChild(spanWithImage);
            // chatButton.appendChild(emptySpan);
            chatButton.appendChild(img);

            chatButton.classList.add("chatbot-toggler");
            chatButton.onclick = function() {
                // window.location.href = `../FriendChat/index.html?friendId=${friend}`;
                const chatHeader = document.querySelector(".chatbot header h2");
                chatHeader.textContent = "Chat avec " + friend;
                document.body.classList.toggle("show-chatbot");
            };


            friendElement.appendChild(chatButton);

            
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");

const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
console.log(chatInput)
console.log(chatInput.scrollHeight)
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; 
}


const handleChat = () => {
    userMessage = chatInput.value.trim();
    if(!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
