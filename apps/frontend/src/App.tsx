import { useCallback, useState } from 'react';
import { WorkLogForm } from './features/workLog/WorkLogForm';
import { WorkLogList } from './features/workLog/WorkLogList';
import type { WorkLogEntry } from './types/workLog';
import styles from './App.module.css';

export default function App() {
  const [editingEntry, setEditingEntry] = useState<WorkLogEntry | null>(null);

  const handleEdit = useCallback((entry: WorkLogEntry) => setEditingEntry(entry), []);
  const handleCancelEdit = useCallback(() => setEditingEntry(null), []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Журнал работ на строительном объекте</h1>
        <p className={styles.subheading}>
          Учёт выполненных работ: вид, объём, исполнитель и дата.
        </p>
      </header>

      <main className={styles.main}>
        <WorkLogForm editingEntry={editingEntry} onCancelEdit={handleCancelEdit} />
        <WorkLogList editingId={editingEntry?.id ?? null} onEdit={handleEdit} />
      </main>
    </div>
  );
}
