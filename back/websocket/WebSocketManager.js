import jwt from "jsonwebtoken";
import RoomManager from "./RoomManager.js";

class WebSocketManager {
  constructor(io) {
    this.io = io;
    this.waitingPlayers = [];
    this.roomNumber = 1;
    this.roomManager = new RoomManager();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.io.on("connection", (socket) => {
      console.log("Nouveau client WebSocket connecté", socket.id);
      // Ajoute le joueur à la file d'attente
      this.waitingPlayers.push(socket.id);

      if (this.waitingPlayers.length === 2) {
        // Créer une room unique pour ces deux joueurs
        const roomName = `room-${(this.roomNumber += 1)}`; // Nom de room unique
        const player1 = this.waitingPlayers.shift(); // Retirer le premier joueur de la file d'attente
        const player2 = this.waitingPlayers.shift(); // Retirer le deuxième joueur de la file d'attente

        // Faire rejoindre les deux joueurs à la room
        this.io.to(player1).socketsJoin(roomName);
        this.io.to(player2).socketsJoin(roomName);

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

          // Ajoute le joueur à une room
          this.roomManager.addPlayerToRoom(
            socket.id,
            user.username,
            this.roomId,
          );
        } catch (error) {
          socket.disconnect();
          console.log("Authentification échouée");
        }
      });

      // Écouteur pour les mises à jour de la grille
      socket.on("gridUpdate", (gridState) => {
        const adversaryId = this.roomManager.findAdversaryId(socket.id);
        if (adversaryId) {
          this.io.to(adversaryId).emit("opponentGridUpdate", gridState);
        }
      });

      // Gérer la déconnexion
      socket.on("disconnect", (reason) => {
        console.log(`Client WebSocket déconnecté ${socket.id}:`, reason);

        const adversaryId = this.roomManager.findAdversaryId(socket.id);
        if (adversaryId) {
          const roomId = Object.entries(this.rooms).find(([players]) =>
            players.includes(socket.id),
          )?.[0];

          if (roomId) {
            this.rooms[roomId] = this.rooms[roomId].filter(
              (id) => id !== socket.id,
            );
            console.log(`Joueur ${socket.id} retiré de la salle ${roomId}`);
            this.roomManager.handleRoomTimer(roomId);
          }
        }
      });
    });
  }

  static initialize(io) {
    return new WebSocketManager(io);
  }
}

export default WebSocketManager;
