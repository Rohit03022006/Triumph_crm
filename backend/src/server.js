import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";

const app = createApp();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  // chat.gateway.js will register room-join / message handlers here (Step 6)
});

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    server.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} (${env.NODE_ENV})`);
      console.log(`📚 Swagger API Docs available at http://localhost:${env.PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
