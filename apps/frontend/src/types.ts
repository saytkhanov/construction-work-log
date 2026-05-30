export interface WorkType {
  id: number;
  name: string;
  unit: string;
  createdAt: string;
}

export interface WorkLog {
  id: number;
  date: string; // YYYY-MM-DD
  workTypeId: number;
  workType: Pick<WorkType, 'id' | 'name' | 'unit'>;
  volume: number;
  executor: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkLogPayload {
  date: string;
  workTypeId: number;
  volume: number;
  executor: string;
  notes?: string;
}

export type UpdateWorkLogPayload = Partial<CreateWorkLogPayload>;
