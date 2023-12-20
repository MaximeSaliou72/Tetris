class RoomManager {
  constructor() {
    this.rooms = {};
    this.roomTimers = {};
    this.roomIdCounter = 1;
  }

  // Crée une nouvelle room avec des joueurs spécifiques (pour les invitations)
  createInvitationRoom(inviterId, inviteeId) {
    const roomId = this.createRoom(false, [inviterId, inviteeId]);
    this.rooms[roomId].isFull = true; // Marquer la room comme complète
    return roomId;
  }

  // Crée une nouvelle room
  createRoom(isRandom = true, initialPlayers = []) {
    const roomId = `room-${(this.roomIdCounter += 1)}`; // Génère un ID unique
    this.rooms[roomId] = {
      players: initialPlayers,
      isRandom,
      isFull: false,
    };
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
      players: room.players, // S'assurer que 'players' contient les infos nécessaires
      isFull: room.isFull,
      isRandom: room.isRandom,
    };
  }

  // Récupère la liste des rooms disponibles
  getAvailableRooms() {
    return Object.entries(this.rooms)
      .filter(([room]) => !room.isFull && room.isRandom)
      .map(([id, room]) => ({ id, ...room }));
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
    room.players.push({ id: playerId, username }); // Stocker un objet avec l'ID et le nom d'utilisateur
    if (room.players.length === 2) {
      room.isFull = true;
    }
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
}

export default RoomManager;
