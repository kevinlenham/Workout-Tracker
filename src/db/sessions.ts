import { db } from './database'
import { newId } from './id'
import { templateRepo } from './templates'
import type { SessionExercise, SetEntry, WorkoutSession } from './types'

function emptySet(): SetEntry {
  return { id: newId(), weight: null, reps: null, note: '' }
}

async function mutateSession(
  id: string,
  mutate: (session: WorkoutSession) => void,
): Promise<WorkoutSession> {
  return db.transaction('rw', db.sessions, async () => {
    const session = await db.sessions.get(id)
    if (!session) throw new Error(`Session not found: ${id}`)
    mutate(session)
    await db.sessions.put(session)
    return session
  })
}

async function getInProgress(): Promise<WorkoutSession | undefined> {
  return db.sessions.where('status').equals('in-progress').first()
}

async function get(id: string): Promise<WorkoutSession | undefined> {
  return db.sessions.get(id)
}

async function start(templateId: string): Promise<WorkoutSession> {
  const existing = await getInProgress()
  if (existing) {
    throw new Error('An in-progress session already exists; finish or discard it first.')
  }

  const template = await templateRepo.get(templateId)
  if (!template) throw new Error(`Template not found: ${templateId}`)

  const exercises: SessionExercise[] = template.items.map((item) => ({
    id: newId(),
    exerciseId: item.exerciseId,
    sets: Array.from({ length: item.setCount }, emptySet),
  }))

  const session: WorkoutSession = {
    id: newId(),
    templateId,
    startedAt: Date.now(),
    completedAt: null,
    status: 'in-progress',
    exercises,
  }

  await db.sessions.add(session)
  return session
}

async function patchSet(
  sessionId: string,
  exerciseIndex: number,
  setIndex: number,
  patch: Partial<SetEntry>,
): Promise<WorkoutSession> {
  return mutateSession(sessionId, (session) => {
    Object.assign(session.exercises[exerciseIndex].sets[setIndex], patch)
  })
}

async function addSet(sessionId: string, exerciseIndex: number): Promise<WorkoutSession> {
  return mutateSession(sessionId, (session) => {
    session.exercises[exerciseIndex].sets.push(emptySet())
  })
}

async function removeSet(
  sessionId: string,
  exerciseIndex: number,
  setIndex: number,
): Promise<WorkoutSession> {
  return mutateSession(sessionId, (session) => {
    session.exercises[exerciseIndex].sets.splice(setIndex, 1)
  })
}

async function addExercise(
  sessionId: string,
  exerciseId: string,
  initialSetCount = 1,
): Promise<WorkoutSession> {
  return mutateSession(sessionId, (session) => {
    session.exercises.push({
      id: newId(),
      exerciseId,
      sets: Array.from({ length: initialSetCount }, emptySet),
    })
  })
}

async function removeExercise(sessionId: string, exerciseIndex: number): Promise<WorkoutSession> {
  return mutateSession(sessionId, (session) => {
    session.exercises.splice(exerciseIndex, 1)
  })
}

async function finish(sessionId: string): Promise<WorkoutSession> {
  return mutateSession(sessionId, (session) => {
    session.completedAt = Date.now()
    session.status = 'completed'
  })
}

async function discard(sessionId: string): Promise<void> {
  const session = await db.sessions.get(sessionId)
  if (!session) return
  if (session.status !== 'in-progress') {
    throw new Error('Only an in-progress session can be discarded.')
  }
  await db.sessions.delete(sessionId)
}

async function remove(sessionId: string): Promise<void> {
  await db.sessions.delete(sessionId)
}

/** Reverse-chronological list of completed sessions, for History. */
async function listCompleted(): Promise<WorkoutSession[]> {
  const sessions = await db.sessions.where('status').equals('completed').toArray()
  return sessions.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
}

/**
 * The most recent *completed* session of the same template that logged this
 * exercise, returned as its set array — used to render the "last session
 * hint". Undefined when there's no prior session or the exercise wasn't
 * logged in it. In-progress sessions are never considered.
 */
async function previousSets(
  templateId: string,
  exerciseId: string,
): Promise<SetEntry[] | undefined> {
  const sessions = await db.sessions
    .where('templateId')
    .equals(templateId)
    .and((s) => s.status === 'completed')
    .toArray()

  const latest = sessions.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0]
  if (!latest) return undefined

  const exercise = latest.exercises.find((e) => e.exerciseId === exerciseId)
  return exercise?.sets
}

export const sessionRepo = {
  start,
  get,
  getInProgress,
  patchSet,
  addSet,
  removeSet,
  addExercise,
  removeExercise,
  finish,
  discard,
  remove,
  listCompleted,
  previousSets,
}
