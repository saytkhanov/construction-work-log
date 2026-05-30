import { WorkLogForm } from './features/workLog/WorkLogForm';
import { WorkLogList } from './features/workLog/WorkLogList';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Журнал работ на строительном объекте</h1>
        <p className={styles.subheading}>
          Учёт выполненных работ: вид, объём, исполнитель и дата.
        </p>
      </header>

      <main className={styles.main}>
        <WorkLogForm />
        <WorkLogList />
      </main>
    </div>
  );
}
