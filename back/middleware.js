import cors from "@koa/cors";

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const koaCors = cors(corsOptions);

export const socketIoCors = async (server) => {
  const socketIoModule = await import("socket.io");
  const io = new socketIoModule.Server(server, { cors: corsOptions });
  return io;
};
