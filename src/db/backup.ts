import { db } from './database'
import { BACKUP_VERSION, type BackupFile } from './types'

async function exportAll(): Promise<BackupFile> {
  const [exercises, templates, sessions] = await Promise.all([
    db.exercises.toArray(),
    db.templates.toArray(),
    db.sessions.toArray(),
  ])
  return { version: BACKUP_VERSION, exercises, templates, sessions }
}

/** Replaces all current data with the contents of the backup file. */
async function importAll(data: unknown): Promise<void> {
  if (typeof data !== 'object' || data === null) {
    throw new Error('This file is not a valid Workouts backup.')
  }

  const candidate = data as Record<string, unknown>
  if (candidate.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version: ${candidate.version}`)
  }
  if (
    !Array.isArray(candidate.exercises) ||
    !Array.isArray(candidate.templates) ||
    !Array.isArray(candidate.sessions)
  ) {
    throw new Error('This backup file is missing required data and cannot be imported.')
  }

  const backup = candidate as unknown as BackupFile

  await db.transaction('rw', db.exercises, db.templates, db.sessions, async () => {
    await Promise.all([db.exercises.clear(), db.templates.clear(), db.sessions.clear()])
    await Promise.all([
      db.exercises.bulkAdd(backup.exercises),
      db.templates.bulkAdd(backup.templates),
      db.sessions.bulkAdd(backup.sessions),
    ])
  })
}

export const backupRepo = { exportAll, importAll }
