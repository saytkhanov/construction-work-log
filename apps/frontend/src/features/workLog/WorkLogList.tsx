import { useMemo, useState } from 'react';
import { useWorkLogEntries, useDeleteWorkLogEntry } from '../../hooks/useWorkLogEntries';
import { useWorkTypes } from '../../hooks/useWorkTypes';
import type { WorkLogEntriesFilters } from '../../api/workLogEntries';
import styles from './WorkLogList.module.css';

function formatDate(iso: string): string {
  // date приходит как ISO datetime — берём календарную часть YYYY-MM-DD.
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}

export function WorkLogList() {
  const [filters, setFilters] = useState<WorkLogEntriesFilters>({});
  const { data: workTypes } = useWorkTypes();
  const { data: workLogs, isLoading, isError } = useWorkLogEntries(filters);
  const deleteWorkLog = useDeleteWorkLogEntry();

  const totalsByUnit = useMemo(() => {
    const totals = new Map<string, number>();
    workLogs?.forEach((log) => {
      totals.set(log.unit, (totals.get(log.unit) ?? 0) + log.volume);
    });
    return Array.from(totals.entries());
  }, [workLogs]);

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить запись журнала?')) {
      deleteWorkLog.mutate(id);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Журнал работ</h2>
        <label className={styles.filter}>
          <span>Вид работ:</span>
          <select
            value={filters.workTypeId ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                workTypeId: event.target.value || undefined,
              }))
            }
          >
            <option value="">Все</option>
            {workTypes?.map((workType) => (
              <option key={workType.id} value={workType.id}>
                {workType.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p className={styles.muted}>Загрузка…</p>}
      {isError && <p className={styles.error}>Не удалось загрузить журнал.</p>}

      {!isLoading && !isError && workLogs && workLogs.length === 0 && (
        <p className={styles.muted}>Записей пока нет. Добавьте первую с помощью формы выше.</p>
      )}

      {workLogs && workLogs.length > 0 && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Вид работ</th>
                  <th className={styles.numeric}>Объём</th>
                  <th>Исполнитель</th>
                  <th>Примечание</th>
                  <th aria-label="Действия" />
                </tr>
              </thead>
              <tbody>
                {workLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.date)}</td>
                    <td>{log.workType.name}</td>
                    <td className={styles.numeric}>
                      {log.volume} {log.unit}
                    </td>
                    <td>{log.executorName}</td>
                    <td className={styles.notes}>{log.comment ?? '—'}</td>
                    <td className={styles.actions}>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(log.id)}
                        disabled={deleteWorkLog.isPending}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.totals}>
            Итого по объёму:{' '}
            {totalsByUnit.map(([unit, sum], index) => (
              <span key={unit}>
                {index > 0 && ', '}
                <strong>
                  {Math.round(sum * 100) / 100} {unit}
                </strong>
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
