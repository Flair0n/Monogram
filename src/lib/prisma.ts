/**
 * Prisma Client Configuration
 * 
 * Singleton instance of Prisma Client for database operations
 * Prevents multiple instances in development with hot reload
 */

import { PrismaClient } from '@prisma/client';
import { isDevelopment } from '../config/env';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (isDevelopment) globalThis.prisma = prisma;

// Export types for convenience (available after running prisma:generate)
export type { User, Space, Membership, Prompt, Response, Settings } from '@prisma/client';
export { UserRole, MembershipRole, Theme, LandingPage, ProfileVisibility } from '@prisma/client';
