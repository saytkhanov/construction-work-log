export interface WorkType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLogEntry {
  id: string;
  date: string; // ISO datetime, например "2026-05-29T00:00:00.000Z"
  workTypeId: string;
  workType: Pick<WorkType, 'id' | 'name'>;
  volume: number;
  unit: string;
  executorName: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkLogEntryPayload {
  date: string; // YYYY-MM-DD
  workTypeId: string;
  volume: number;
  unit: string;
  executorName: string;
  comment?: string;
}

export type UpdateWorkLogEntryPayload = Partial<CreateWorkLogEntryPayload>;
