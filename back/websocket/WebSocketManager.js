import jwt from "jsonwebtoken";
import fs from "fs";
import RoomManager from "./RoomManager.js";

const rawConfig = fs.readFileSync(new URL("../config.json", import.meta.url)); // Ajustez le chemin si nécessaire
const config = JSON.parse(rawConfig);
// Dans setupWebSocket, après la création de la room

class WebSocketManager {
  constructor(io) {
    this.io = io;
    this.waitingPlayers = [];
    this.roomNumber = 1;
    this.userMap = new Map(); // Initialisation avant RoomManager
    this.roomManager = new RoomManager(this.userMap);
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.io.on("connection", (socket) => {
      console.log("Client WebSocket connecté", socket.id);

      // Ajoute le joueur à la file d'attente
      this.waitingPlayers.push(socket.id);

      // Vérifie si deux joueurs sont en attente pour créer une room

      // Écouteur pour rejoindre une room avec un token
      socket.on("joinRoomWithToken", (data) => {
        console.log(
          `[joinRoomWithToken] Demande de rejoindre une room avec token par ${socket.id}`,
          data,
        );
        const { token } = data;
        const roomIdToken = this.findRoomIdByToken(token);
        if (roomIdToken) {
          // Assurez-vous que 'user.username' est correctement défini
          const user = this.userMap.get(socket.id);
          if (user) {
            console.log(
              `[joinRoomWithToken] Ajout de l'utilisateur ${user.username} (ID: ${user.id}) à la room ${roomIdToken}`,
            );
            this.roomManager.addPlayerToRoom(
              socket.id,
              user.username,
              roomIdToken,
            );
            socket.join(roomIdToken);
            this.io
              .to(roomIdToken)
              .emit("playerJoined", { roomIdToken, playerId: socket.id });
          } else {
            socket.emit("invalidToken", "Token invalide");
          }
        }
      });

      socket.on("message", (message) => {
        console.log(`Message reçu de ${socket.id}:`, message);

        // Traiter le message ici
      });

      // Gérer l'authentification et récupérer l'ID du joueur

      socket.on("authenticate", async (data) => {
        console.log(
          "[Authentification] Données reçues pour l'authentification:",
          data,
        );
        try {
          const decoded = jwt.verify(data.token, config.jwt_secret);

          // Supposons que le token contient l'ID et le nom d'utilisateur
          const user = { id: decoded.id, username: decoded.username };

          this.userMap.set(socket.id, user);
          if (
            this.waitingPlayers.includes(socket.id) &&
            this.waitingPlayers.length === 2
          ) {
            // Récupère les ID des joueurs en attente
            const player1 = this.waitingPlayers[0]; // ID du premier joueur
            const player2 = this.waitingPlayers[1]; // ID du deuxième joueur

            const user1 = this.userMap.get(player1);
            const user2 = this.userMap.get(player2);

            if (user1 && user2) {
              this.waitingPlayers.shift();
              this.waitingPlayers.shift();
              const roomId = this.roomManager.createRoom(true, [
                player1,
                player2,
              ]);
              // Crée une nouvelle room

              // Récupère les détails de la room créée
              const roomDetails = this.roomManager.getRoomDetails(roomId);
              const roomToken = roomDetails.token;

              // Faire rejoindre les deux joueurs à la room
              this.io.to(player1).socketsJoin(roomId);
              this.io.to(player2).socketsJoin(roomId);

              // Informer les joueurs que la room a été créée
              this.io.to(player1).emit("roomCreated", { roomId, roomToken });
              this.io.to(player2).emit("roomCreated", { roomId, roomToken });
              console.log(
                `Room créée : ${roomId} avec les joueurs ${player1} et ${player2}`,
              );
            }
          }
        } catch (error) {
          socket.emit("auth_error", "Échec de l'authentification");
        }
        // try {
        //   const user = jwt.verify(data.token, "votre_secret_jwt");
        //   this.userMap.set(socket.id, user);
        //   console.log(
        //     `[Authentification] Utilisateur ${user.username} ajouté au Map pour le socket ID: ${socket.id}`,
        //   );

        //   // Ajoute le joueur à une room
        //   this.roomManager.addPlayerToRoom(
        //     socket.id,
        //     user.username,
        //     this.roomId,
        //   );
        // } catch (error) {
        //   socket.disconnect();
        //   console.log("[Authentification] Échec de l'authentification", error);
        // }
      });

      // Écouteur pour les mises à jour de la grille

      socket.on("gridUpdate", (gridState) => {
        const adversaryId = this.roomManager.findAdversaryId(socket.id);

        if (adversaryId) {
          this.io.to(adversaryId).emit("opponentGridUpdate", gridState);
        }
      });

      // Écouteur pour les mises à jour des emote

      socket.on("emote", (emote) => {
        console.log("Emote received:", emote);

        const adversaryId = this.roomManager.findAdversaryId(socket.id);

        if (adversaryId) {
          this.io.to(adversaryId).emit("opponentEmote", emote);
        }
      });

      // Écouteur pour les mises à jour des données du jeu
      socket.on("gameData", (originalGameData) => {
        try {
          const { token } = originalGameData;
          if (token) {
            const decoded = jwt.verify(token, config.jwt_secret);
            const { username } = decoded;

            // Créer un nouvel objet gameData avec le username
            const gameDataWithUsername = {
              ...originalGameData,
              username,
            };
            delete gameDataWithUsername.token; // Supprime le champ token

            console.log(
              `GameData received from ${username}:`,
              gameDataWithUsername,
            );

            // Logique pour gérer les données du jeu
            const roomId = this.roomManager.findRoomIdByPlayerId(socket.id);
            if (roomId) {
              this.io.to(roomId).emit("updateGameState", gameDataWithUsername);
            }
          }
        } catch (error) {
          console.error(
            "Erreur lors de la vérification du token pour gameData",
            error,
          );
        }
      });

      // Gérer la déconnexion

      socket.on("disconnect", (reason) => {
        if (this.userMap.has(socket.id)) {
          const user = this.userMap.get(socket.id);
          console.log(
            `[Déconnexion] Client ${user.username} WebSocket déconnecté ${socket.id}: ${reason}`,
          );
          this.userMap.delete(socket.id);
          console.log(
            `[Déconnexion] Informations de l'utilisateur ${user.username} supprimées de userMap pour le socket ID: ${socket.id}`,
          );
        } else {
          console.log(
            `[Déconnexion] Client non authentifié WebSocket déconnecté ${socket.id}: ${reason}`,
          );
        }
        console.log(`[disconnect] Client ${socket.id} déconnecté: ${reason}`);
        const adversaryId = this.roomManager.findAdversaryId(socket.id);

        if (adversaryId) {
          const roomID = Object.entries(this.rooms).find(([players]) =>
            players.includes(socket.id),
          )?.[0];

          if (roomID) {
            this.rooms[roomID] = this.rooms[roomID].filter(
              (id) => id !== socket.id,
            );

            console.log(`Joueur ${socket.id} retiré de la salle ${roomID}`);

            this.roomManager.handleRoomTimer(roomID);
          }
        }
      });
    });
  }

  // Méthode pour trouver une roomId par token
  findRoomIdByToken(token) {
    return Object.keys(this.roomManager.rooms).find(
      (roomIdentifiant) =>
        this.roomManager.rooms[roomIdentifiant].token === token,
    );
  }

  static initialize(io) {
    return new WebSocketManager(io);
  }
}

export default WebSocketManager;
