import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from '../ui/Header'
import { PlusIcon, TrashIcon } from '../ui/icons'
import { exerciseRepo } from '../db'
import styles from './ExerciseLibrary.module.css'

export function ExerciseLibrary() {
  const exercises = useLiveQuery(() => exerciseRepo.listActive(), [])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    await exerciseRepo.create(name)
    setNewName('')
  }

  function startEditing(id: string, name: string) {
    setEditingId(id)
    setEditingName(name)
  }

  async function saveEditing() {
    if (!editingId) return
    const name = editingName.trim()
    if (!name) return
    await exerciseRepo.rename(editingId, name)
    setEditingId(null)
    setEditingName('')
  }

  async function handleArchive(id: string, name: string) {
    const confirmed = window.confirm(
      `Remove "${name}" from the exercise library? Existing workouts will still keep it.`,
    )
    if (!confirmed) return
    await exerciseRepo.archive(id)
  }

  return (
    <>
      <Header title="Exercises" back />
      <div className={styles.content}>
        <form
          className={styles.addForm}
          onSubmit={(event) => {
            event.preventDefault()
            handleCreate()
          }}
        >
          <input
            className={styles.input}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="New exercise"
            aria-label="New exercise name"
          />
          <button type="submit" className={styles.addButton} aria-label="Add exercise">
            <PlusIcon size={20} />
          </button>
        </form>

        {exercises && exercises.length === 0 && (
          <p className={styles.empty}>No exercises yet. Add one to use it in templates.</p>
        )}

        {exercises && exercises.length > 0 && (
          <div className={styles.list}>
            {exercises.map((exercise) => {
              const isEditing = editingId === exercise.id

              return (
                <div className={styles.item} key={exercise.id}>
                  {isEditing ? (
                    <input
                      className={styles.editInput}
                      value={editingName}
                      autoFocus
                      onChange={(event) => setEditingName(event.target.value)}
                      onBlur={saveEditing}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveEditing()
                        if (event.key === 'Escape') {
                          setEditingId(null)
                          setEditingName('')
                        }
                      }}
                      aria-label={`Rename ${exercise.name}`}
                    />
                  ) : (
                    <button
                      type="button"
                      className={styles.nameButton}
                      onClick={() => startEditing(exercise.id, exercise.name)}
                    >
                      {exercise.name}
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.deleteButton}
                    aria-label={`Remove ${exercise.name}`}
                    onClick={() => handleArchive(exercise.id, exercise.name)}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
