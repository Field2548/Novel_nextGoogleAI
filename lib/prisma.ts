// FIX: Changed import to a namespace import (`import * as Prisma ...`) to address the "no exported member 'PrismaClient'" error. This can resolve module resolution issues in some environments.
import * as Prisma from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: Prisma.PrismaClient | undefined;
}

export const prisma =
  // FIX: Replaced `global` with `globalThis` to fix 'Cannot find name 'global'' error.
  globalThis.prisma ||
  new Prisma.PrismaClient({
    log: ['query'],
  });

// FIX: Replaced `global` with `globalThis` to fix 'Cannot find name 'global'' error.
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
