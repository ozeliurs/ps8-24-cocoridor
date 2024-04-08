

function adjustZoom() {
    const friendList = document.getElementById("friendList");
    const friends = friendList.children;
    let fontSize = 16; // Taille de police de base en pixels
    let itemSpacing = 10; // Espacement de base entre les éléments en pixels

    // Ajuster la taille de la police et l'espacement en fonction du nombre d'amis
    if (friends.length > 5) {
        fontSize += (friends.length - 5); // Augmenter la taille de la police
        itemSpacing += (friends.length - 5); // Augmenter l'espacement
    }

    // Appliquer la taille de la police et l'espacement à chaque élément de la liste d'amis
    for (const friend of friends) {
        friend.style.fontSize = `${fontSize}px`;
        friend.style.marginBottom = `${itemSpacing}px`;
    }
}


const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");

const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? 
    `<span s="material-symbols-outlined">
        <img
            src="../Game-Page/FermierJ2.png"
            alt="FermierJ2"
            width="100%"
            height="100%"
        />
    </span><p></p>` : 
    `<span s="material-symbols-outlined">
        <img
            src="../Game-Page/PouletJ1.png"
            alt="PouletJ1"
            width="100%"
            height="100%"
        />
    </span><p></p>`;    
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; 
}


const handleChat = async () => {
    const userMessage = chatInput.value.trim();
    if(!userMessage) return;
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;
    console.log("test")
    console.log(nameUser+"/"+friendName+"/"+userMessage)
    fetch("http://localhost:8000/api/addMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: nameUser,
          friendName: friendName,
          message: userMessage,
        }),
      })
          .then((response) => {
            if (response.ok) {
              alert("Demande envoyée");
            } else {
              throw new Error("La requête a échoué");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      socket.emit('newMessage', nameUser, friendName);
      await updateConv(nameUser, friendName);

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


async function updateConv(nameUser, friendName) {
    console.log("updateConv")
    await fetch("http://localhost:8000/api/getConv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: nameUser, friendName: friendName }),
    })
      .then((response) => response.json())
      .then((data) => {
        chatbox.innerHTML = "";
        const conv = data.conv;
        for (const message of conv) {
          if (message.split("/")[0] === nameUser) {
            chatbox.appendChild(createChatLi(message.split("/")[1], "outgoing"));
          } else {
            chatbox.appendChild(createChatLi(message.split("/")[1], "incoming"));
          }
          chatbox.scrollTo(0, chatbox.scrollHeight);

        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  
sendChatBtn.addEventListener("click", handleChat());
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
