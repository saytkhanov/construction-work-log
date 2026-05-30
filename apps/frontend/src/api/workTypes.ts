import { apiClient } from './client';
import type { WorkType } from '../types';

export const workTypesApi = {
  list: () => apiClient.get<WorkType[]>('/work-types'),
};
