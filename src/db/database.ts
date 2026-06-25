import Dexie, { type Table } from 'dexie'
import type { Exercise, WorkoutTemplate, WorkoutSession } from './types'

export class WorkoutsDatabase extends Dexie {
  exercises!: Table<Exercise, string>
  templates!: Table<WorkoutTemplate, string>
  sessions!: Table<WorkoutSession, string>

  constructor(name = 'workouts') {
    super(name)
    this.version(1).stores({
      exercises: 'id, archived',
      templates: 'id',
      sessions: 'id, templateId, status, completedAt',
    })
  }
}

export const db = new WorkoutsDatabase()
