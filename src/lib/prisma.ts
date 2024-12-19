/**
 * @fileoverview Prisma client singleton
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma


