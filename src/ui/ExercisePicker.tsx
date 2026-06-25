import { useEffect, useId, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { exerciseRepo } from '../db'
import styles from './ExercisePicker.module.css'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

type ExercisePickerProps = {
  open: boolean
  onClose: () => void
  onPick: (exerciseId: string) => void
}

export function ExercisePicker({ open, onClose, onPick }: ExercisePickerProps) {
  const [query, setQuery] = useState('')
  const exercises = useLiveQuery(() => exerciseRepo.listActive(), [])
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Remember and restore focus to whatever opened the sheet, since it behaves like a modal.
  // Focus is moved to the search input here (not via the input's `autoFocus`) so this capture
  // of the trigger always runs first — `autoFocus` would otherwise race it and win, since native
  // autofocus steals focus during the same commit, before any effect gets a chance to read it.
  useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement as HTMLElement | null
    searchInputRef.current?.focus()
    return () => triggerRef.current?.focus?.()
  }, [open])

  // Escape closes; Tab/Shift+Tab is trapped within the sheet while open.
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !sheetRef.current) return

      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = (exercises ?? []).filter((e) => e.name.toLowerCase().includes(normalizedQuery))
  const exactMatch = (exercises ?? []).some((e) => e.name.toLowerCase() === normalizedQuery)

  async function handleCreate() {
    const name = query.trim()
    if (!name) return
    const exercise = await exerciseRepo.create(name)
    setQuery('')
    onPick(exercise.id)
  }

  function handlePick(id: string) {
    setQuery('')
    onPick(id)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          Add exercise
        </h2>
        <input
          ref={searchInputRef}
          className={styles.search}
          aria-label="Search or create an exercise"
          placeholder="Search or create an exercise"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.list}>
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className={styles.item}
              onClick={() => handlePick(exercise.id)}
            >
              {exercise.name}
            </button>
          ))}
          {normalizedQuery && !exactMatch && (
            <button
              type="button"
              className={`${styles.item} ${styles.createItem}`}
              onClick={handleCreate}
            >
              + Create &quot;{query.trim()}&quot;
            </button>
          )}
          {filtered.length === 0 && !normalizedQuery && (
            <p className={styles.empty}>Start typing to search or create an exercise.</p>
          )}
        </div>
        <button type="button" className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
