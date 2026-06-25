export type Exercise = {
  id: string
  name: string
  archived: boolean
}

export type TemplateItem = {
  exerciseId: string
  setCount: number
}

export type WorkoutTemplate = {
  id: string
  name: string
  items: TemplateItem[] // ordered
}

export type SetEntry = {
  id: string // stable identity for React keys; survives reordering/removal of sibling sets
  weight: number | null // kg, decimals allowed; null = not entered
  reps: number | null // integer; null = not entered
  note: string // optional, "" when empty
}

export type SessionExercise = {
  id: string // stable identity for React keys; survives reordering/removal of sibling exercises
  exerciseId: string
  sets: SetEntry[]
}

export type SessionStatus = 'in-progress' | 'completed'

export type WorkoutSession = {
  id: string
  templateId: string
  startedAt: number // epoch ms
  completedAt: number | null
  status: SessionStatus
  exercises: SessionExercise[] // self-contained snapshot
}

export const BACKUP_VERSION = 1

export type BackupFile = {
  version: typeof BACKUP_VERSION
  exercises: Exercise[]
  templates: WorkoutTemplate[]
  sessions: WorkoutSession[]
}
