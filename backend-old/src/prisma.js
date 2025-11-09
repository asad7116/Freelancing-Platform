// backend/src/prisma.js
import { PrismaClient } from '@prisma/client';

// Reuse a single client in dev to avoid exhausting DB connections on hot reloads
const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;     // <-- default export (fixes your error)
export { prisma };         // optional named export if you want it elsewhere
