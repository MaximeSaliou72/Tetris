class RoomManager {
  constructor(userMap) {
    this.rooms = {};
    this.roomTimers = {};
    this.roomIdCounter = 1;
    this.userMap = userMap;
  }

  // Crée une nouvelle room avec des joueurs spécifiques (pour les invitations)
  createInvitationRoom(inviterId, inviteeId) {
    const roomId = this.createRoom(false, [inviterId, inviteeId]);
    this.rooms[roomId].isFull = true; // Marquer la room comme complète
    return roomId;
  }

  // Méthode pour générer un token unique de 5 caractères
  static generateToken() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 5; i += 1) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }

  // Crée une nouvelle room
  createRoom(isRandom = true, initialPlayers = []) {
    const roomId = `room-${(this.roomIdCounter += 1)}`;
    this.rooms[roomId] = {
      players: initialPlayers,
      isRandom,
      isFull: false,
      token: RoomManager.generateToken(),
    };

    // Récupérer les usernames des joueurs à partir de la userMap
    const playerUsernames = initialPlayers
      .map((playerId) => {
        const user = this.userMap.get(playerId);
        return user ? user.username : "Inconnu";
      })
      .join(", ");

    console.log(
      `[createRoom] Room créée: ${roomId} avec les joueurs ${playerUsernames}`,
    );
    return roomId;
  }

  // Vérifie si une room a de la place
  isRoomAvailable(roomId) {
    return this.rooms[roomId] && !this.rooms[roomId].isFull;
  }

  // Méthode pour obtenir les détails d'un joueur spécifique dans une room
  getPlayerDetails(roomId, playerId) {
    const room = this.rooms[roomId];
    if (!room) {
      return null; // Si la room n'existe pas, renvoyer null
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return null; // Si le joueur n'est pas trouvé dans la room, renvoyer null
    }

    return player; // Renvoyer les détails du joueur
  }

  // Méthode pour obtenir les détails d'une room spécifique
  getRoomDetails(roomId) {
    const room = this.rooms[roomId];
    if (!room) {
      return null; // Si la room n'existe pas, renvoyer null
    }

    console.log("players:", room.players);

    return {
      roomId,
      players: room.players,
      isFull: room.isFull,
      isRandom: room.isRandom,
      token: room.token,
    };
  }

  // Récupère la liste des rooms disponibles
  getAvailableRooms() {
    return Object.entries(this.rooms)
      .filter(([, room]) => !room.isFull && room.isRandom)
      .map(([id, room]) => ({
        id,
        players: room.players.map((playerId) => this.userMap.get(playerId)), // Transforme les ID des joueurs en leurs détails
        isRandom: room.isRandom,
        isFull: room.isFull,
        token: room.token,
      }));
  }

  getRoomStatus() {
    return Object.entries(this.rooms).map(([roomId, { players }]) => ({
      roomId,
      players,
      status: players.length === 2 ? "Complet" : "Disponible",
    }));
  }

  // Ajoute un joueur à une room
  addPlayerToRoom(playerId, username, roomId) {
    const room = this.rooms[roomId];
    if (!room || room.players.length >= 2 || !room.isRandom) {
      return false;
    }
    room.players.push({ id: playerId, username });
    console.log(
      `[addPlayerToRoom] Ajout de l'utilisateur ${username} (ID: ${playerId}) à la room ${roomId}`,
    );
    if (room.players.length === 2) {
      room.isFull = true;
    }
    console.log(
      `[addPlayerToRoom] Ajout du joueur ${username} (ID: ${playerId}) à la room ${roomId}`,
    );
    return true;
  }

  // Trouve l'adversaire d'un joueur
  findAdversaryId(playerId) {
    let adversaryId = null;
    Object.entries(this.rooms).forEach(([players]) => {
      if (players.includes(playerId)) {
        adversaryId = players.find((p) => p !== playerId);
      }
    });
    return adversaryId;
  }

  // Nouvelle fonction pour gérer le minuteur de la salle
  handleRoomTimer(roomId) {
    if (!this.roomTimers[roomId]) {
      console.log(
        `Démarrage d'un minuteur de 5 minutes pour la salle ${roomId}`,
      );
      this.roomTimers[roomId] = setTimeout(
        () => {
          if (this.rooms[roomId] && this.rooms[roomId].length === 1) {
            console.log(`Fermeture de la salle ${roomId} après inactivité`);
            delete this.rooms[roomId];
          }
          delete this.roomTimers[roomId];
        },
        5 * 60 * 1000, // 5 minutes
      );
    } else if (this.rooms[roomId] && this.rooms[roomId].length === 0) {
      console.log(
        `Annulation du minuteur pour la salle ${roomId} car tous les joueurs se sont déconnectés`,
      );
      clearTimeout(this.roomTimers[roomId]);
      delete this.roomTimers[roomId];
    }
  }

  updateGameState(playerId, gameState) {
    // Trouvez la room à laquelle appartient le joueur
    const roomId = this.findRoomIdByPlayerId(playerId);
    if (!roomId) {
      console.error("Room not found for player:", playerId);
      return;
    }

    // Mettez à jour l'état du jeu pour cette room
    const room = this.rooms[roomId];
    room.gameState = gameState; // ou une logique de mise à jour plus complexe

    console.log(`Game state updated for room ${roomId}`);
  }

  // Méthode pour trouver l'ID de la room par ID du joueur
  findRoomIdByPlayerId(playerId) {
    return Object.keys(this.rooms).find((roomId) =>
      this.rooms[roomId].players.includes(playerId),
    );
  }
}

export default RoomManager;
