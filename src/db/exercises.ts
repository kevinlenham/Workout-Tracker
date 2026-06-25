import { db } from './database'
import { newId } from './id'
import type { Exercise } from './types'

async function create(name: string): Promise<Exercise> {
  const exercise: Exercise = { id: newId(), name, archived: false }
  await db.exercises.add(exercise)
  return exercise
}

async function rename(id: string, name: string): Promise<void> {
  await db.exercises.update(id, { name })
}

async function archive(id: string): Promise<void> {
  await db.exercises.update(id, { archived: true })
}

/** Non-archived exercises, for pickers when building templates/sessions. */
async function listActive(): Promise<Exercise[]> {
  return db.exercises.filter((e) => !e.archived).toArray()
}

/** All exercises including archived, for resolving names in history. */
async function listAll(): Promise<Exercise[]> {
  return db.exercises.toArray()
}

async function get(id: string): Promise<Exercise | undefined> {
  return db.exercises.get(id)
}

export const exerciseRepo = { create, rename, archive, listActive, listAll, get }
