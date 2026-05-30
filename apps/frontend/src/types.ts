export interface WorkType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  workTypeId: string;
  workType: Pick<WorkType, 'id' | 'name'>;
  volume: number;
  unit: string;
  executorName: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkLogPayload {
  date: string;
  workTypeId: string;
  volume: number;
  unit: string;
  executorName: string;
  comment?: string;
}

export type UpdateWorkLogPayload = Partial<CreateWorkLogPayload>;
