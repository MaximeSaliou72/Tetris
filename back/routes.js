// Importations ES module
import Router from "koa-router";
import RoomManager from "./websocket/RoomManager.js";
import AuthController from "./controllers/authController.js";

const router = new Router();
const roomManager = new RoomManager();

// Route d'accueil
router.get("/", async (ctx) => {
  ctx.body = "Bienvenue sur Tetris Online!";
});

// Route pour récupéer la liste des rooms
router.get("/rooms", AuthController.tokenRenewalMiddleware, async (ctx) => {
  const availableRooms = roomManager.getAvailableRooms();
  ctx.body = availableRooms;
});

// Route pour récupérer le statut des rooms
router.get(
  "/room-status",
  AuthController.tokenRenewalMiddleware,
  async (ctx) => {
    const roomStatus = roomManager.getRoomStatus();
    ctx.body = { roomStatus };
  },
);

// Route pour créer une room
router.post(
  "/create-room",
  AuthController.tokenRenewalMiddleware,
  async (ctx) => {
    const isRandom = ctx.request.body.isRandom || true;
    const roomId = roomManager.createRoom(isRandom);
    ctx.body = { roomId };
  },
);

// Route pour créer une room d'invitation
router.post(
  "/invite-to-room",
  AuthController.tokenRenewalMiddleware,
  async (ctx) => {
    const { inviterId, inviteeId } = ctx.request.body;

    // Vérifier si les identifiants des joueurs sont fournis
    if (!inviterId || !inviteeId) {
      ctx.status = 400;
      ctx.body = {
        error: "Les identifiants 'inviterId' et 'inviteeId' sont nécessaires.",
      };
      return;
    }

    try {
      const roomId = roomManager.createInvitationRoom(inviterId, inviteeId);
      ctx.body = { roomId };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        error: "Erreur lors de la création de la room d'invitation.",
      };
    }
  },
);

// Route pour obtenir les détails d'une room spécifique
router.get(
  "/room/:roomId",
  AuthController.tokenRenewalMiddleware,
  async (ctx) => {
    const { roomId } = ctx.params;
    const roomDetails = roomManager.getRoomDetails(roomId);

    if (roomDetails) {
      ctx.body = roomDetails;
    } else {
      ctx.status = 404;
      ctx.body = { error: "Room non trouvée" };
    }
  },
);

// Route pour obtenir les détails d'un joueur spécifique dans une room
router.get(
  "/room/:roomId/player/:playerId",
  AuthController.tokenRenewalMiddleware,
  async (ctx) => {
    const { roomId, playerId } = ctx.params;
    const playerDetails = roomManager.getPlayerDetails(roomId, playerId);

    if (playerDetails) {
      ctx.body = playerDetails;
    } else {
      ctx.status = 404;
      ctx.body = { error: "Joueur non trouvé dans la room spécifiée" };
    }
  },
);

export default router;
