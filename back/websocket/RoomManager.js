class RoomManager {
  constructor() {
    this.rooms = {};
    this.roomTimers = {};
  }

  // Crée une nouvelle room
  createRoom(isRandom = true) {
    const roomId = `room-${Object.keys(this.rooms).length + 1}`;
    this.rooms[roomId] = {
      players: [],
      isRandom,
      isFull: false,
    };
    return roomId;
  }

  // Vérifie si une room a de la place
  isRoomAvailable(roomId) {
    return this.rooms[roomId] && !this.rooms[roomId].isFull;
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
  addPlayerToRoom(playerId, roomId) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [];
    }
    this.rooms[roomId].push(playerId);
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
