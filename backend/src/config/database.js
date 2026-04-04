import { PrismaClient } from '@prisma/client';

let prisma;

export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

export async function connectDatabase() {
  const client = getPrismaClient();
  try {
    await client.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Database disconnected');
  }
}
