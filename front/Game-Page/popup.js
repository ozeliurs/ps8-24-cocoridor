const exitBtn = document.getElementById("exit"); // Ajout de l'élément "exit"

exitBtn.addEventListener("click", function() {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <div class="popup-content">
            <p>Êtes-vous sûr de vouloir quitter ?</p>
            <button id="confirm">Oui</button>
            <button id="cancel">Non</button>
        </div>
    `;
    document.body.appendChild(popup); // Ajout de la popup au corps du document

    const confirmBtn = document.getElementById("confirm");
    const cancelBtn = document.getElementById("cancel");

    confirmBtn.addEventListener("click", function() {
        // Rediriger l'utilisateur
        window.location.href = '../index.html'; // Changer le chemin selon votre besoin
        document.body.removeChild(popup); // Supprimer la popup
    });

    cancelBtn.addEventListener("click", function() {
        document.body.removeChild(popup); // Supprimer la popup
    });
});
