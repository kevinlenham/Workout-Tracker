import { useId, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../ui/Header'
import { ExercisePicker } from '../ui/ExercisePicker'
import { PlusIcon, TrashIcon } from '../ui/icons'
import { exerciseRepo, sessionRepo, templateRepo, type SetEntry } from '../db'
import { formatDate } from '../lib/formatDate'
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
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-weight`}>
          Weight (kg)
        </label>
        <input
          id={`${fieldId}-weight`}
          className={styles.input}
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          placeholder={hint?.weight != null ? String(hint.weight) : '—'}
          value={weightText}
          onChange={(e) => handleWeightChange(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-reps`}>
          Reps
        </label>
        <input
          id={`${fieldId}-reps`}
          className={styles.input}
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          placeholder={hint?.reps != null ? String(hint.reps) : '—'}
          value={repsText}
          onChange={(e) => handleRepsChange(e.target.value)}
        />
      </div>
      <button type="button" className={styles.removeSetButton} aria-label="Remove set" onClick={onRemove}>
        <TrashIcon size={19} />
      </button>
      <div className={styles.noteRow}>
        {hint?.note && <div className={styles.prevNote}>Last time: {hint.note}</div>}
        <label className={styles.srOnly} htmlFor={`${fieldId}-note`}>
          Note
        </label>
        <input
          id={`${fieldId}-note`}
          className={styles.input}
          type="text"
          placeholder="Note"
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
        />
      </div>
    </div>
  )
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

  return (
    <>
      <Header title={template?.name ?? 'Workout'} back />
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.metaTitle}>{template?.name ?? 'Workout'}</span>
          <span className={styles.metaSub}>
            {isInProgress ? 'In progress' : formatDate(session.completedAt ?? session.startedAt)}
          </span>
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
                <TrashIcon size={19} />
              </button>
            </div>

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
              + Add set
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
