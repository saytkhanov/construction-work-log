import { Prisma } from '@prisma/client';
import type { WorkLogEntry, WorkType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/httpError';
import type { CreateWorkLogInput, ListWorkLogsQuery, UpdateWorkLogInput } from './workLogs.schemas';

type WorkLogEntryWithType = WorkLogEntry & { workType: WorkType };

/** DTO, отдаваемый наружу: Decimal → number, Date → YYYY-MM-DD. */
export type WorkLogEntryDto = {
  id: string;
  date: string;
  workTypeId: string;
  workType: { id: string; name: string };
  volume: number;
  unit: string;
  executorName: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function serialize(entry: WorkLogEntryWithType): WorkLogEntryDto {
  return {
    id: entry.id,
    date: toIsoDate(entry.date),
    workTypeId: entry.workTypeId,
    workType: {
      id: entry.workType.id,
      name: entry.workType.name,
    },
    volume: entry.volume.toNumber(),
    unit: entry.unit,
    executorName: entry.executorName,
    comment: entry.comment,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

async function assertWorkTypeExists(workTypeId: string): Promise<void> {
  const exists = await prisma.workType.findUnique({ where: { id: workTypeId }, select: { id: true } });
  if (!exists) {
    throw HttpError.badRequest('Specified work type does not exist', { workTypeId });
  }
}

export const workLogsService = {
  async list(filters: ListWorkLogsQuery): Promise<WorkLogEntryDto[]> {
    const where: Prisma.WorkLogEntryWhereInput = {};

    if (filters.workTypeId) {
      where.workTypeId = filters.workTypeId;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    const entries = await prisma.workLogEntry.findMany({
      where,
      include: { workType: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return entries.map(serialize);
  },

  async getById(id: string): Promise<WorkLogEntryDto> {
    const entry = await prisma.workLogEntry.findUnique({ where: { id }, include: { workType: true } });
    if (!entry) {
      throw HttpError.notFound('Work log entry not found');
    }
    return serialize(entry);
  },

  async create(input: CreateWorkLogInput): Promise<WorkLogEntryDto> {
    await assertWorkTypeExists(input.workTypeId);

    const entry = await prisma.workLogEntry.create({
      data: {
        date: new Date(input.date),
        workTypeId: input.workTypeId,
        volume: new Prisma.Decimal(input.volume),
        unit: input.unit,
        executorName: input.executorName,
        comment: input.comment ? input.comment : null,
      },
      include: { workType: true },
    });

    return serialize(entry);
  },

  async update(id: string, input: UpdateWorkLogInput): Promise<WorkLogEntryDto> {
    if (input.workTypeId !== undefined) {
      await assertWorkTypeExists(input.workTypeId);
    }

    const data: Prisma.WorkLogEntryUpdateInput = {};
    if (input.date !== undefined) data.date = new Date(input.date);
    if (input.workTypeId !== undefined) data.workType = { connect: { id: input.workTypeId } };
    if (input.volume !== undefined) data.volume = new Prisma.Decimal(input.volume);
    if (input.unit !== undefined) data.unit = input.unit;
    if (input.executorName !== undefined) data.executorName = input.executorName;
    if (input.comment !== undefined) data.comment = input.comment ? input.comment : null;

    const entry = await prisma.workLogEntry.update({
      where: { id },
      data,
      include: { workType: true },
    });

    return serialize(entry);
  },

  async remove(id: string): Promise<void> {
    await prisma.workLogEntry.delete({ where: { id } });
  },
};
