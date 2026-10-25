import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

/** @type {PrismaClient} */
let prisma;

// Prevent multiple Prisma instances during dev hot-reload
if (env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ["warn", "error"],
    });
  }
  prisma = globalThis.__prisma;
}

export { prisma };
