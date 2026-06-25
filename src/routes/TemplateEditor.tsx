import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../ui/Header'
import { Stepper } from '../ui/Stepper'
import { ExercisePicker } from '../ui/ExercisePicker'
import { PlusIcon, TrashIcon } from '../ui/icons'
import { exerciseRepo, sessionRepo, templateRepo, type TemplateItem } from '../db'
import { useInProgressSession } from '../ui/useInProgressSession'
import styles from './TemplateEditor.module.css'

export function TemplateEditor() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const isNew = params.id === undefined
  const [createdId, setCreatedId] = useState<string | null>(null)
  const creating = useRef(false)
  const id = params.id ?? createdId

  useEffect(() => {
    if (!isNew || creating.current) return
    creating.current = true
    templateRepo.create('New Template', []).then((template) => {
      setCreatedId(template.id)
      navigate(`/templates/${template.id}`, { replace: true })
    })
  }, [isNew, navigate])

  const template = useLiveQuery(() => (id ? templateRepo.get(id) : undefined), [id])
  const exercises = useLiveQuery(() => exerciseRepo.listAll(), [])
  const inProgress = useInProgressSession()

  const [name, setName] = useState('')
  const syncedNameForId = useRef<string | null>(null)
  useEffect(() => {
    if (!template || syncedNameForId.current === template.id) return
    syncedNameForId.current = template.id
    setName(template.name)
  }, [template])

  const [pickerOpen, setPickerOpen] = useState(false)

  if (!id || !template) return null

  const exerciseName = (exerciseId: string) =>
    exercises?.find((e) => e.id === exerciseId)?.name ?? 'Unknown exercise'

  function updateItems(items: TemplateItem[]) {
    templateRepo.update(id!, { items })
  }

  function handleNameChange(value: string) {
    setName(value)
    templateRepo.update(id!, { name: value })
  }

  function handleSetCountChange(index: number, setCount: number) {
    const items = template!.items.map((item, i) => (i === index ? { ...item, setCount } : item))
    updateItems(items)
  }

  function handleRemoveItem(index: number) {
    updateItems(template!.items.filter((_, i) => i !== index))
  }

  function handleMove(index: number, direction: -1 | 1) {
    const items = [...template!.items]
    const target = index + direction
    if (target < 0 || target >= items.length) return
    ;[items[index], items[target]] = [items[target], items[index]]
    updateItems(items)
  }

  function handlePickExercise(exerciseId: string) {
    updateItems([...template!.items, { exerciseId, setCount: 1 }])
    setPickerOpen(false)
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${template!.name}"? Sessions you've already logged from it will be kept.`,
    )
    if (!confirmed) return
    await templateRepo.remove(id!)
    navigate('/templates', { replace: true })
  }

  async function handleStart() {
    const session = await sessionRepo.start(id!)
    navigate(`/session/${session.id}`)
  }

  const canStart = template.items.length > 0 && !inProgress

  return (
    <>
      <Header title="Edit Template" back />
      <div className={styles.content}>
        <input
          className={styles.nameInput}
          aria-label="Template name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Template name"
        />

        <p className={styles.sectionLabel}>Exercises</p>
        {template.items.length === 0 && (
          <p className={styles.empty}>Add exercises to build out this workout.</p>
        )}
        <div className={styles.items}>
          {template.items.map((item, index) => (
            <div className={styles.item} key={`${item.exerciseId}-${index}`}>
              <div className={styles.itemTopRow}>
                <span className={styles.itemName}>{exerciseName(item.exerciseId)}</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  aria-label="Remove exercise"
                  onClick={() => handleRemoveItem(index)}
                >
                  <TrashIcon size={20} />
                </button>
              </div>
              <div className={styles.itemBottomRow}>
                <Stepper
                  value={item.setCount}
                  onChange={(setCount) => handleSetCountChange(index, setCount)}
                />
                <div className={styles.reorder}>
                  <button
                    type="button"
                    className={styles.reorderButton}
                    disabled={index === 0}
                    aria-label="Move up"
                    onClick={() => handleMove(index, -1)}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className={styles.reorderButton}
                    disabled={index === template.items.length - 1}
                    aria-label="Move down"
                    onClick={() => handleMove(index, 1)}
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className={styles.addButton} onClick={() => setPickerOpen(true)}>
          <PlusIcon size={18} />
          Add exercise
        </button>

        <div className={styles.actions}>
          {inProgress ? (
            <>
              <p className={styles.resumeNote}>
                You have a workout in progress. Finish or discard it before starting another.
              </p>
              <button
                type="button"
                className={styles.startButton}
                onClick={() => navigate(`/session/${inProgress.id}`)}
              >
                Resume in-progress workout
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.startButton}
              disabled={!canStart}
              onClick={handleStart}
            >
              Start session
            </button>
          )}
          <button type="button" className={styles.deleteButton} onClick={handleDelete}>
            Delete template
          </button>
        </div>
      </div>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickExercise}
      />
    </>
  )
}
