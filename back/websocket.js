import jwt from "jsonwebtoken";

const setupWebSocket = (io) => {
  const rooms = {}; // Stocker les salles et les joueurs
  const waitingPlayers = [];
  let roomNumber = 1;

  // Ajoute un joueur à une salle
  function addPlayerToRoom(playerId, roomId) {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(playerId);
  }

  // Trouve l'adversaire d'un joueur
  function findAdversaryId(playerId) {
    let adversaryId = null;
    Object.entries(rooms).forEach(([players]) => {
      if (players.includes(playerId)) {
        adversaryId = players.find((p) => p !== playerId);
      }
    });
    return adversaryId;
  }

  io.on("connection", (socket) => {
    console.log("Nouveau client WebSocket connecté", socket.id);
    // Ajouter le joueur à la file d'attente
    waitingPlayers.push(socket.id);

    if (waitingPlayers.length === 2) {
      // Créer une room unique pour ces deux joueurs
      const roomName = `room-${(roomNumber += 1)}`; // Nom de room unique
      const player1 = waitingPlayers.shift(); // Retirer le premier joueur de la file d'attente
      const player2 = waitingPlayers.shift(); // Retirer le deuxième joueur de la file d'attente

      // Faire rejoindre les deux joueurs à la room
      io.to(player1).socketsJoin(roomName);
      io.to(player2).socketsJoin(roomName);

      console.log(
        `Room créée : ${roomName} avec les joueurs ${player1} et ${player2}`,
      );
    }

    socket.on("message", (message) => {
      console.log(`Message reçu de ${socket.id}:`, message);
      // Traiter le message ici
    });

    // Gérer l'authentification et récupérer l'ID du joueur
    socket.on("authenticate", async (data) => {
      try {
        const user = jwt.verify(data.token, "votre_secret_jwt");
        console.log(`Utilisateur authentifié avec l'ID : ${user.id}`);

        // Ajouter le joueur à une salle
        addPlayerToRoom(socket.id, "room1"); // Exemple, ajustez selon votre logique d'appariement
      } catch (error) {
        socket.disconnect();
        console.log("Authentification échouée");
      }
    });

    // Écouteur pour les mises à jour de la grille
    socket.on("gridUpdate", (gridState) => {
      const adversaryId = findAdversaryId(socket.id);
      if (adversaryId) {
        io.to(adversaryId).emit("opponentGridUpdate", gridState);
      }
    });

    // Gérer la déconnexion
    socket.on("disconnect", (reason) => {
      console.log(`Client WebSocket déconnecté ${socket.id}:`, reason);
      // Ajouter la logique pour gérer la suppression du joueur des salles
    });
  });
};

export default setupWebSocket;
