import { useMemo, useState } from 'react';
import { useWorkLogEntries, useDeleteWorkLogEntry } from '../../hooks/useWorkLogEntries';
import type { WorkLogEntriesFilters } from '../../api/workLogEntries';
import { ApiError } from '../../api/client';
import type { WorkLogEntry } from '../../types/workLog';
import styles from './WorkLogList.module.css';

function formatDate(iso: string): string {
  // date приходит как ISO datetime — берём календарную часть YYYY-MM-DD.
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}

type SortOrder = 'asc' | 'desc';

interface WorkLogListProps {
  editingId: string | null;
  onEdit: (entry: WorkLogEntry) => void;
}

export function WorkLogList({ editingId, onEdit }: WorkLogListProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filters: WorkLogEntriesFilters = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortOrder,
  };

  const { data: entries, isLoading, isError, refetch } = useWorkLogEntries(filters);
  const deleteEntry = useDeleteWorkLogEntry();

  const hasActiveFilters = dateFrom !== '' || dateTo !== '' || sortOrder !== 'desc';

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSortOrder('desc');
  };

  const totalsByUnit = useMemo(() => {
    const totals = new Map<string, number>();
    entries?.forEach((entry) => {
      totals.set(entry.unit, (totals.get(entry.unit) ?? 0) + entry.volume);
    });
    return Array.from(totals.entries());
  }, [entries]);

  const handleDelete = (entry: WorkLogEntry) => {
    if (!window.confirm('Удалить запись журнала?')) {
      return;
    }
    setFeedback(null);
    deleteEntry.mutate(entry.id, {
      onSuccess: () => setFeedback({ type: 'success', text: 'Запись удалена.' }),
      onError: (error) =>
        setFeedback({
          type: 'error',
          text: error instanceof ApiError ? error.message : 'Не удалось удалить запись.',
        }),
    });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Журнал работ</h2>

      <div className={styles.filters}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filterDateFrom">
            Дата от
          </label>
          <input
            id="filterDateFrom"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => setDateFrom(event.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filterDateTo">
            Дата до
          </label>
          <input
            id="filterDateTo"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => setDateTo(event.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filterSort">
            Сортировка по дате
          </label>
          <select
            id="filterSort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className={styles.filterInput}
          >
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
          </select>
        </div>

        <button
          type="button"
          className={styles.resetBtn}
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          Сбросить фильтры
        </button>
      </div>

      {feedback && (
        <p
          className={feedback.type === 'success' ? styles.feedbackOk : styles.feedbackErr}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}

      {isLoading && <p className={styles.muted}>Загрузка…</p>}

      {isError && (
        <div className={styles.errorBox} role="alert">
          <span>Не удалось загрузить журнал.</span>
          <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !isError && entries && entries.length === 0 && (
        <p className={styles.muted}>
          {hasActiveFilters
            ? 'По заданным фильтрам записей не найдено.'
            : 'Записей пока нет. Добавьте первую с помощью формы выше.'}
        </p>
      )}

      {!isError && entries && entries.length > 0 && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата выполнения</th>
                  <th>Вид работ</th>
                  <th className={styles.numeric}>Объём</th>
                  <th>Исполнитель</th>
                  <th>Комментарий</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isRowEditing = entry.id === editingId;
                  const isRowDeleting = deleteEntry.isPending && deleteEntry.variables === entry.id;
                  return (
                    <tr key={entry.id} className={isRowEditing ? styles.editingRow : undefined}>
                      <td>{formatDate(entry.date)}</td>
                      <td>{entry.workType.name}</td>
                      <td className={styles.numeric}>
                        {entry.volume} {entry.unit}
                      </td>
                      <td>{entry.executorName}</td>
                      <td className={styles.notes}>{entry.comment ?? '—'}</td>
                      <td className={styles.actions}>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => onEdit(entry)}
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(entry)}
                          disabled={isRowDeleting}
                        >
                          {isRowDeleting ? 'Удаление…' : 'Удалить'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
