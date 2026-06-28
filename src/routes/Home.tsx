import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Header } from '../ui/Header'
import { TrashIcon } from '../ui/icons'
import { exerciseRepo, sessionRepo, templateRepo, type WorkoutSession } from '../db'
import { formatDuration } from '../lib/formatDuration'
import { pluralize } from '../lib/pluralize'
import styles from './Home.module.css'

type MonthGroup = {
  key: string
  label: string
  sessions: WorkoutSession[]
}

function groupSessionsByMonth(sessions: WorkoutSession[]): MonthGroup[] {
  return sessions.reduce<MonthGroup[]>((groups, session) => {
    const date = new Date(session.completedAt ?? session.startedAt)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const existing = groups.find((group) => group.key === key)

    if (existing) {
      existing.sessions.push(session)
      return groups
    }

    groups.push({
      key,
      label: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      sessions: [session],
    })
    return groups
  }, [])
}

function dayLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, { weekday: 'short' })
}

function dayNumber(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, { day: '2-digit' })
}

function isThisMonth(epochMs: number): boolean {
  const date = new Date(epochMs)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

function countSets(sessions: WorkoutSession[]): number {
  return sessions.reduce(
    (total, session) =>
      total +
      session.exercises.reduce((sessionTotal, exercise) => sessionTotal + exercise.sets.length, 0),
    0,
  )
}

export function Home() {
  const navigate = useNavigate()
  const [setScope, setSetScope] = useState<'month' | 'all'>('month')
  const [workoutScope, setWorkoutScope] = useState<'month' | 'all'>('month')
  const sessions = useLiveQuery(() => sessionRepo.listCompleted(), [])
  const templates = useLiveQuery(() => templateRepo.list(), [])
  const exercises = useLiveQuery(() => exerciseRepo.listAll(), [])
  const templateNameById = new Map((templates ?? []).map((t) => [t.id, t.name]))
  const exerciseNameById = new Map((exercises ?? []).map((exercise) => [exercise.id, exercise.name]))
  const monthGroups = sessions ? groupSessionsByMonth(sessions) : []
  const completedSessions = sessions ?? []
  const thisMonthSessions = completedSessions.filter((session) =>
    isThisMonth(session.completedAt ?? session.startedAt),
  )
  const workoutCount =
    workoutScope === 'month' ? thisMonthSessions.length : completedSessions.length
  const totalSets = setScope === 'month' ? countSets(thisMonthSessions) : countSets(completedSessions)

  async function handleDeleteWorkout(sessionId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this workout?')
    if (!confirmed) return
    await sessionRepo.remove(sessionId)
  }

  function exerciseSummary(session: WorkoutSession): string[] {
    return session.exercises.map((exercise) => {
      const name = exerciseNameById.get(exercise.exerciseId) ?? 'Unknown exercise'
      return `${exercise.sets.length}x ${name}`
    })
  }

  return (
    <>
      <Header title="Workouts" showSettings />
      <div className={styles.content}>
        <section className={styles.stats} aria-label="Workout stats">
          <button
            type="button"
            className={styles.statCard}
            onClick={() => setWorkoutScope((scope) => (scope === 'month' ? 'all' : 'month'))}
            aria-label="Toggle workouts between this month and all time"
          >
            <span className={styles.statLabel}>Workouts</span>
            <strong>{workoutCount}</strong>
            <span className={styles.statMeta}>
              {workoutScope === 'month' ? 'This month' : 'All time'}
            </span>
          </button>
          <button
            type="button"
            className={styles.statCard}
            onClick={() => setSetScope((scope) => (scope === 'month' ? 'all' : 'month'))}
            aria-label="Toggle total sets between this month and all time"
          >
            <span className={styles.statLabel}>Total Sets</span>
            <strong>{totalSets}</strong>
            <span className={styles.statMeta}>
              {setScope === 'month' ? 'This month' : 'All time'}
            </span>
          </button>
        </section>

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
          <div className={styles.months}>
            {monthGroups.map((group) => (
              <section className={styles.month} key={group.key}>
                <div className={styles.monthHeader}>
                  <h2>{group.label}</h2>
                  <span>{pluralize(group.sessions.length, 'workout')}</span>
                </div>

                <div className={styles.monthCard}>
                  {group.sessions.map((session) => (
                    <div className={styles.item} key={session.id}>
                      <button
                        type="button"
                        className={styles.itemOpen}
                        onClick={() => navigate(`/session/${session.id}`)}
                      >
                        <span className={styles.datePill} aria-hidden="true">
                          <span>{dayLabel(session.completedAt ?? session.startedAt)}</span>
                          <strong>{dayNumber(session.completedAt ?? session.startedAt)}</strong>
                        </span>

                        <span className={styles.itemMain}>
                          <span className={styles.itemTopLine}>
                            <span className={styles.itemName}>
                              {session.templateName ??
                                templateNameById.get(session.templateId) ??
                                'Workout'}
                            </span>
                            {session.completedAt != null && (
                              <span className={styles.itemDuration}>
                                {formatDuration(session.completedAt - session.startedAt)}
                              </span>
                            )}
                          </span>

                          <span className={styles.exerciseList}>
                            {exerciseSummary(session).map((exercise) => (
                              <span key={exercise}>{exercise}</span>
                            ))}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        aria-label="Delete workout"
                        onClick={() => handleDeleteWorkout(session.id)}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
