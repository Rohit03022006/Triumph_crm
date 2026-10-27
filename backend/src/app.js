import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import meRoutes from "./modules/users/users.routes.js";
import resourcesRoutes from "./modules/resources/resources.routes.js";
import leadRoutes from "./modules/leads/leads.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";
import { setupSwagger } from "./config/swagger.js";

// Import clients for health checks
import { prisma } from "./config/database.js";
import { redis } from "./config/redis.js";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());

  app.use(express.json({ limit: "2mb" }));

  // Swagger UI for API documentation
  setupSwagger(app);

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", meRoutes);
  app.use("/api/v1/resources", resourcesRoutes);
  app.use("/api/v1/leads", leadRoutes);
  app.use("/api/v1/inventory", inventoryRoutes);
  app.use("/api/v1/logs", logsRoutes);
  app.use("/uploads", express.static("uploads"));
  


  // Comprehensive Health Check Endpoint
  app.get("/health", async (req, res) => {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      port: env.PORT,
      services: {
        database: "unhealthy",
        redis: "unhealthy",
        r2_storage: "unconfigured",
        email: "unconfigured"
      }
    };

    try {
      // 1. Check Database (Prisma)
      await prisma.$queryRaw`SELECT 1`;
      health.services.database = "healthy";

      // 2. Check Redis
      const ping = await redis.ping();
      if (ping === "PONG") {
        health.services.redis = "healthy";
      }

      // 3. Check R2 Config
      if (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_BUCKET_NAME) {
        health.services.r2_storage = "configured";
      }

      // 4. Check Email (Resend) Config
      if (env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("re_")) {
        health.services.email = "configured";
      }
      
      res.status(200).json(health);
    } catch (error) {
      health.status = "error";
      health.message = error.message;
      // Return 503 Service Unavailable if core services are down
      res.status(503).json(health);
    }
  });

  // Next modules mount here:
  // app.use('/api/v1/users', usersRoutes);
  // app.use('/api/v1/leads', leadRoutes);
  // app.use('/api/v1/inventory', inventoryRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
