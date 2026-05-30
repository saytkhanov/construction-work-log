import { useQuery } from '@tanstack/react-query';
import { workTypesApi } from '../api/workTypes';
import { queryKeys } from '../api/queryKeys';

export function useWorkTypes() {
  return useQuery({
    queryKey: queryKeys.workTypes,
    queryFn: () => workTypesApi.list(),
    staleTime: 5 * 60 * 1000, // справочник меняется редко
  });
}
