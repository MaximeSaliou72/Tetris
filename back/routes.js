// Importations ES module
import Router from "koa-router";
import RoomManager from "./websocket/RoomManager.js";

const router = new Router();
const roomManager = new RoomManager();

// Route d'accueil
router.get("/", async (ctx) => {
  ctx.body = "Bienvenue sur Tetris Online!";
});

// Route pour récupéer la liste des rooms
router.get("/rooms", async (ctx) => {
  const availableRooms = roomManager.getAvailableRooms();
  ctx.body = { availableRooms };
});

// Route pour récupérer le statut des rooms
router.get("/room-status", async (ctx) => {
  const roomStatus = roomManager.getRoomStatus();
  ctx.body = { roomStatus };
});

// Route pour créer une room
router.post("/create-room", async (ctx) => {
  const isRandom = ctx.request.body.isRandom || true;
  const roomId = roomManager.createRoom(isRandom);
  ctx.body = { roomId };
});

export default router;
