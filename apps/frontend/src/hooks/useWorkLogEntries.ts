import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workLogEntriesApi, type WorkLogEntriesFilters } from '../api/workLogEntries';
import { queryKeys } from '../api/queryKeys';
import type { CreateWorkLogEntryPayload, UpdateWorkLogEntryPayload } from '../types/workLog';

const LIST_KEY = ['work-log-entries'];

export function useWorkLogEntries(filters: WorkLogEntriesFilters = {}) {
  return useQuery({
    queryKey: queryKeys.workLogEntries(filters),
    queryFn: () => workLogEntriesApi.list(filters),
  });
}

export function useCreateWorkLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkLogEntryPayload) => workLogEntriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useUpdateWorkLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkLogEntryPayload }) =>
      workLogEntriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useDeleteWorkLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workLogEntriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
