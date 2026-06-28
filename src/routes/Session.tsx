import { useId, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../ui/Header'
import { ExercisePicker } from '../ui/ExercisePicker'
import { PlusIcon, TrashIcon } from '../ui/icons'
import { exerciseRepo, sessionRepo, templateRepo, type SetEntry } from '../db'
import styles from './Session.module.css'

type SetRowProps = {
  index: number
  set: SetEntry
  hint: SetEntry | undefined
  onPatch: (patch: Partial<SetEntry>) => void
  onRemove: () => void
}

function SetRow({ index, set, hint, onPatch, onRemove }: SetRowProps) {
  const fieldId = useId()
  const [weightText, setWeightText] = useState(set.weight === null ? '' : String(set.weight))
  const [repsText, setRepsText] = useState(set.reps === null ? '' : String(set.reps))
  const [note, setNote] = useState(set.note)

  function handleWeightChange(text: string) {
    setWeightText(text)
    const parsed = text.trim() === '' ? null : Number(text)
    onPatch({ weight: parsed === null || Number.isNaN(parsed) ? null : parsed })
  }

  function handleRepsChange(text: string) {
    setRepsText(text)
    const parsed = text.trim() === '' ? null : Number.parseInt(text, 10)
    onPatch({ reps: parsed === null || Number.isNaN(parsed) ? null : parsed })
  }

  function handleNoteChange(text: string) {
    setNote(text)
    onPatch({ note: text })
  }

  return (
    <div className={styles.setRow}>
      <div className={styles.setIndex}>{index + 1}</div>

      <input
        id={`${fieldId}-weight`}
        className={styles.input}
        aria-label={`Set ${index + 1} weight in kg`}
        type="number"
        inputMode="decimal"
        step="0.5"
        min="0"
        placeholder={hint?.weight != null ? String(hint.weight) : '-'}
        value={weightText}
        onChange={(e) => handleWeightChange(e.target.value)}
      />

      <input
        id={`${fieldId}-reps`}
        className={styles.input}
        aria-label={`Set ${index + 1} reps`}
        type="number"
        inputMode="numeric"
        step="1"
        min="0"
        placeholder={hint?.reps != null ? String(hint.reps) : '-'}
        value={repsText}
        onChange={(e) => handleRepsChange(e.target.value)}
      />

      <div className={styles.noteCell}>
        {hint?.note && <div className={styles.prevNote}>Last: {hint.note}</div>}
        <label className={styles.srOnly} htmlFor={`${fieldId}-note`}>
          Note
        </label>
        <input
          id={`${fieldId}-note`}
          className={styles.noteInput}
          type="text"
          placeholder="Note"
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
        />
      </div>

      <button
        type="button"
        className={styles.removeSetButton}
        aria-label="Remove set"
        onClick={onRemove}
      >
        <TrashIcon size={18} />
      </button>
    </div>
  )
}

function formatHeaderDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function formatSessionDateTime(epochMs: number): string {
  return new Date(epochMs).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function Session() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [pickerOpen, setPickerOpen] = useState(false)

  const session = useLiveQuery(() => (id ? sessionRepo.get(id) : undefined), [id])
  const template = useLiveQuery(
    () => (session ? templateRepo.get(session.templateId) : undefined),
    [session?.templateId],
  )
  const exercises = useLiveQuery(() => exerciseRepo.listAll(), [])
  const hints = useLiveQuery(async () => {
    if (!session) return undefined
    return Promise.all(
      session.exercises.map((ex) => sessionRepo.previousSets(session.templateId, ex.exerciseId)),
    )
  }, [session])

  if (!id || !session) return null

  const exerciseName = (exerciseId: string) =>
    exercises?.find((e) => e.id === exerciseId)?.name ?? 'Unknown exercise'

  async function handleFinish() {
    await sessionRepo.finish(id!)
    navigate('/', { replace: true })
  }

  async function handleDiscard() {
    const confirmed = window.confirm('Discard this in-progress workout? This cannot be undone.')
    if (!confirmed) return
    await sessionRepo.discard(id!)
    navigate('/', { replace: true })
  }

  function handlePickExercise(exerciseId: string) {
    sessionRepo.addExercise(id!, exerciseId, 1)
    setPickerOpen(false)
  }

  const isInProgress = session.status === 'in-progress'
  const title = session.templateName ?? template?.name ?? 'Workout'

  return (
    <>
      <Header title={formatHeaderDate(session.completedAt ?? session.startedAt)} back />
      <div className={styles.content}>
        <div className={styles.summaryCard}>
          <h2>{title}</h2>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Start Time</span>
              <time dateTime={new Date(session.startedAt).toISOString()}>
                {formatSessionDateTime(session.startedAt)}
              </time>
            </div>
            <div className={styles.summaryRow}>
              <span>End Time</span>
              {session.completedAt == null ? (
                <span className={styles.inProgress}>In progress</span>
              ) : (
                <time dateTime={new Date(session.completedAt).toISOString()}>
                  {formatSessionDateTime(session.completedAt)}
                </time>
              )}
            </div>
          </div>
        </div>

        {session.exercises.map((sessionExercise, exIdx) => (
          <div className={styles.exercise} key={sessionExercise.id}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseName}>
                {exerciseName(sessionExercise.exerciseId)}
              </span>
              <button
                type="button"
                className={styles.removeExerciseButton}
                aria-label="Remove exercise"
                onClick={() => sessionRepo.removeExercise(id!, exIdx)}
              >
                <TrashIcon size={18} />
              </button>
            </div>

            {sessionExercise.sets.length > 0 && (
              <div className={styles.setHeader} aria-hidden="true">
                <span />
                <span>Kg</span>
                <span>Reps</span>
                <span>Notes</span>
                <span />
              </div>
            )}

            {sessionExercise.sets.map((set, setIdx) => (
              <SetRow
                key={set.id}
                index={setIdx}
                set={set}
                hint={hints?.[exIdx]?.[setIdx]}
                onPatch={(patch) => sessionRepo.patchSet(id!, exIdx, setIdx, patch)}
                onRemove={() => sessionRepo.removeSet(id!, exIdx, setIdx)}
              />
            ))}

            <button
              type="button"
              className={styles.addSetButton}
              onClick={() => sessionRepo.addSet(id!, exIdx)}
            >
              + Add Set
            </button>
          </div>
        ))}

        <button type="button" className={styles.addExerciseButton} onClick={() => setPickerOpen(true)}>
          <PlusIcon size={18} />
          Add exercise
        </button>

        {isInProgress && (
          <div className={styles.actions}>
            <button type="button" className={styles.finishButton} onClick={handleFinish}>
              Finish workout
            </button>
            <button type="button" className={styles.discardButton} onClick={handleDiscard}>
              Discard workout
            </button>
          </div>
        )}
      </div>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickExercise}
      />
    </>
  )
}
