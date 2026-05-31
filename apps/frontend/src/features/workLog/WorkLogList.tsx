import { useMemo, useState } from 'react';
import { useWorkLogEntries, useDeleteWorkLogEntry } from '../../hooks/useWorkLogEntries';
import type { WorkLogEntriesFilters } from '../../api/workLogEntries';
import styles from './WorkLogList.module.css';

function formatDate(iso: string): string {
  // date приходит как ISO datetime — берём календарную часть YYYY-MM-DD.
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}

type SortOrder = 'asc' | 'desc';

export function WorkLogList() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить запись журнала?')) {
      deleteEntry.mutate(id);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Журнал работ</h2>

      <div className={styles.filters}>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Дата от</span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => setDateFrom(event.target.value)}
            className={styles.filterInput}
          />
        </label>

        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Дата до</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => setDateTo(event.target.value)}
            className={styles.filterInput}
          />
        </label>

        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Сортировка по дате</span>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className={styles.filterInput}
          >
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
          </select>
        </label>

        <button
          type="button"
          className={styles.resetBtn}
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          Сбросить фильтры
        </button>
      </div>

      {isLoading && <p className={styles.muted}>Загрузка…</p>}

      {isError && (
        <div className={styles.errorBox}>
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
                  <th aria-label="Действия" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
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
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleteEntry.isPending}
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
