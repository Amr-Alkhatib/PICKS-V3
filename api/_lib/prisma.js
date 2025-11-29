import { PrismaClient } from '@prisma/client';

// Reuse Prisma client across invocations in serverless.
let prisma;
if (!global._picks_prisma) {
  global._picks_prisma = new PrismaClient();
}
prisma = global._picks_prisma;

export default prisma;
