import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as neon from "@neondatabase/serverless";
import { Pool as LocalPool } from "pg";
import ws from "ws";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || "";
  const isNeon = connectionString.includes("neon.tech");

  let adapter;

  if (isNeon) {
    // Configuração para NEON (Serverless/WebSocket)
    if (typeof window === "undefined") {
      neon.neonConfig.webSocketConstructor = ws;
    }
    adapter = new PrismaNeon({ connectionString });
  } else {
    // Configuração para POSTGRES LOCAL (TCP)
    const pool = new LocalPool({ connectionString });
    adapter = new PrismaPg(pool);
  }

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
