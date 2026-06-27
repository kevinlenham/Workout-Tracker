import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Header } from '../ui/Header'
import { TrashIcon } from '../ui/icons'
import { sessionRepo, templateRepo } from '../db'
import { formatDate } from '../lib/formatDate'
import { formatDuration } from '../lib/formatDuration'
import { pluralize } from '../lib/pluralize'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  const sessions = useLiveQuery(() => sessionRepo.listCompleted(), [])
  const templates = useLiveQuery(() => templateRepo.list(), [])
  const templateNameById = new Map((templates ?? []).map((t) => [t.id, t.name]))

  async function handleDeleteWorkout(sessionId: string) {
    const confirmed = window.confirm('Delete this workout? This cannot be undone.')
    if (!confirmed) return
    await sessionRepo.remove(sessionId)
  }

  return (
    <>
      <Header title="Workouts" showSettings />
      <div className={styles.content}>
        {sessions && sessions.length === 0 && (
          <div className={styles.empty}>
            <p>No workouts logged yet.</p>
            <button
              type="button"
              className={styles.emptyButton}
              onClick={() => navigate('/templates')}
            >
              Create a template
            </button>
          </div>
        )}
        {sessions && sessions.length > 0 && (
          <div className={styles.list}>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={styles.item}
              >
                <button
                  type="button"
                  className={styles.itemOpen}
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <div className={styles.itemMain}>
                    <span className={styles.itemName}>
                      {templateNameById.get(session.templateId) ?? 'Workout'}
                    </span>
                    <span className={styles.itemSub}>
                      {pluralize(session.exercises.length, 'exercise')}
                    </span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemDate}>
                      {formatDate(session.completedAt ?? session.startedAt)}
                    </span>
                    {session.completedAt != null && (
                      <span className={styles.itemDuration}>
                        {formatDuration(session.completedAt - session.startedAt)}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  aria-label="Delete workout"
                  onClick={() => handleDeleteWorkout(session.id)}
                >
                  <TrashIcon size={19} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
