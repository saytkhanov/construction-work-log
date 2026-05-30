import { prisma } from '../../lib/prisma';

/**
 * Слой доступа к данным справочника видов работ.
 */
export const workTypesService = {
  list() {
    return prisma.workType.findMany({
      orderBy: { name: 'asc' },
    });
  },
};
