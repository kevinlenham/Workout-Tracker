import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './database'
import { exerciseRepo } from './exercises'
import { templateRepo } from './templates'
import { sessionRepo } from './sessions'
import { backupRepo } from './backup'
import { BACKUP_VERSION } from './types'

beforeEach(async () => {
  await Promise.all([db.exercises.clear(), db.templates.clear(), db.sessions.clear()])
})

async function setUpTemplate() {
  const bench = await exerciseRepo.create('Bench Press')
  const squat = await exerciseRepo.create('Squat')
  const template = await templateRepo.create('Push Day', [
    { exerciseId: bench.id, setCount: 3 },
    { exerciseId: squat.id, setCount: 2 },
  ])
  return { bench, squat, template }
}

describe('sessionRepo.start', () => {
  it('builds the session snapshot from the template and persists it as in-progress', async () => {
    const { bench, squat, template } = await setUpTemplate()

    const session = await sessionRepo.start(template.id)

    expect(session.templateId).toBe(template.id)
    expect(session.status).toBe('in-progress')
    expect(session.completedAt).toBeNull()
    const emptySet = { id: expect.any(String), weight: null, reps: null, note: '' }
    expect(session.exercises).toEqual([
      { id: expect.any(String), exerciseId: bench.id, sets: [emptySet, emptySet, emptySet] },
      { id: expect.any(String), exerciseId: squat.id, sets: [emptySet, emptySet] },
    ])

    const persisted = await sessionRepo.get(session.id)
    expect(persisted).toEqual(session)
  })

  it('enforces exactly one in-progress session at a time', async () => {
    const { template } = await setUpTemplate()
    await sessionRepo.start(template.id)

    await expect(sessionRepo.start(template.id)).rejects.toThrow(/in-progress session already exists/i)

    const inProgress = await db.sessions.where('status').equals('in-progress').toArray()
    expect(inProgress).toHaveLength(1)
  })
})

describe('session auto-save mutations', () => {
  it('patches a set field without touching the template', async () => {
    const { template } = await setUpTemplate()
    const session = await sessionRepo.start(template.id)

    await sessionRepo.patchSet(session.id, 0, 0, { weight: 60, reps: 10 })

    const updated = await sessionRepo.get(session.id)
    expect(updated!.exercises[0].sets[0]).toEqual({
      id: expect.any(String),
      weight: 60,
      reps: 10,
      note: '',
    })
    expect(updated!.exercises[0].sets[1]).toEqual({
      id: expect.any(String),
      weight: null,
      reps: null,
      note: '',
    })

    const templateAfter = await templateRepo.get(template.id)
    expect(templateAfter!.items[0].setCount).toBe(3)
  })

  it('adds and removes sets on a session without affecting the template', async () => {
    const { template } = await setUpTemplate()
    const session = await sessionRepo.start(template.id)

    await sessionRepo.addSet(session.id, 0)
    let updated = await sessionRepo.get(session.id)
    expect(updated!.exercises[0].sets).toHaveLength(4)

    await sessionRepo.removeSet(session.id, 0, 0)
    updated = await sessionRepo.get(session.id)
    expect(updated!.exercises[0].sets).toHaveLength(3)

    const templateAfter = await templateRepo.get(template.id)
    expect(templateAfter!.items[0].setCount).toBe(3)
  })

  it('adds and removes exercises on a session without affecting the template', async () => {
    const { template } = await setUpTemplate()
    const dips = await exerciseRepo.create('Dips')
    const session = await sessionRepo.start(template.id)

    await sessionRepo.addExercise(session.id, dips.id, 2)
    let updated = await sessionRepo.get(session.id)
    expect(updated!.exercises).toHaveLength(3)
    expect(updated!.exercises[2]).toEqual({
      id: expect.any(String),
      exerciseId: dips.id,
      sets: [
        { id: expect.any(String), weight: null, reps: null, note: '' },
        { id: expect.any(String), weight: null, reps: null, note: '' },
      ],
    })

    await sessionRepo.removeExercise(session.id, 1)
    updated = await sessionRepo.get(session.id)
    expect(updated!.exercises.map((e) => e.exerciseId)).toEqual([
      template.items[0].exerciseId,
      dips.id,
    ])

    const templateAfter = await templateRepo.get(template.id)
    expect(templateAfter!.items).toHaveLength(2)
  })
})

describe('finish and discard', () => {
  it('finish stamps completedAt and marks the session completed', async () => {
    const { template } = await setUpTemplate()
    const session = await sessionRepo.start(template.id)

    const finished = await sessionRepo.finish(session.id)

    expect(finished.status).toBe('completed')
    expect(finished.completedAt).not.toBeNull()
    expect(await sessionRepo.getInProgress()).toBeUndefined()
  })

  it('discard removes an in-progress session', async () => {
    const { template } = await setUpTemplate()
    const session = await sessionRepo.start(template.id)

    await sessionRepo.discard(session.id)

    expect(await sessionRepo.get(session.id)).toBeUndefined()
  })

  it('refuses to discard a completed session', async () => {
    const { template } = await setUpTemplate()
    const session = await sessionRepo.start(template.id)
    await sessionRepo.finish(session.id)

    await expect(sessionRepo.discard(session.id)).rejects.toThrow(/only an in-progress session/i)
    expect(await sessionRepo.get(session.id)).not.toBeUndefined()
  })
})

describe('sessionRepo.previousSets (last-session hint)', () => {
  it('returns undefined when there is no prior completed session', async () => {
    const { bench, template } = await setUpTemplate()
    expect(await sessionRepo.previousSets(template.id, bench.id)).toBeUndefined()
  })

  it('returns the most recent completed session’s sets for that exercise', async () => {
    const { bench, template } = await setUpTemplate()

    const first = await sessionRepo.start(template.id)
    await sessionRepo.patchSet(first.id, 0, 0, { weight: 50, reps: 10 })
    await sessionRepo.finish(first.id)

    const second = await sessionRepo.start(template.id)
    await sessionRepo.patchSet(second.id, 0, 0, { weight: 60, reps: 9 })
    await sessionRepo.finish(second.id)

    const hint = await sessionRepo.previousSets(template.id, bench.id)
    expect(hint?.[0]).toEqual({ id: expect.any(String), weight: 60, reps: 9, note: '' })
  })

  it('ignores in-progress sessions when resolving the hint', async () => {
    const { bench, template } = await setUpTemplate()

    const completed = await sessionRepo.start(template.id)
    await sessionRepo.patchSet(completed.id, 0, 0, { weight: 50, reps: 10 })
    await sessionRepo.finish(completed.id)

    const inProgress = await sessionRepo.start(template.id)
    await sessionRepo.patchSet(inProgress.id, 0, 0, { weight: 999, reps: 999 })

    const hint = await sessionRepo.previousSets(template.id, bench.id)
    expect(hint?.[0]).toEqual({ id: expect.any(String), weight: 50, reps: 10, note: '' })
  })

  it('is blank (undefined slot) for a set index beyond the prior session’s count', async () => {
    const { bench, template } = await setUpTemplate()

    const session = await sessionRepo.start(template.id)
    await sessionRepo.removeSet(session.id, 0, 2) // bench now has 2 sets instead of 3
    await sessionRepo.finish(session.id)

    const hint = await sessionRepo.previousSets(template.id, bench.id)
    expect(hint).toHaveLength(2)
    expect(hint?.[2]).toBeUndefined()
  })
})

describe('exercise library integrity', () => {
  it('rename resolves through the id, including for historical sessions', async () => {
    const { bench, template } = await setUpTemplate()
    const session = await sessionRepo.start(template.id)
    await sessionRepo.finish(session.id)

    await exerciseRepo.rename(bench.id, 'Barbell Bench Press')

    const historical = await sessionRepo.get(session.id)
    const resolvedName = (await exerciseRepo.get(historical!.exercises[0].exerciseId))!.name
    expect(resolvedName).toBe('Barbell Bench Press')
  })

  it('archive hides an exercise from the active picker but keeps it resolvable', async () => {
    const { bench } = await setUpTemplate()

    await exerciseRepo.archive(bench.id)

    expect(await exerciseRepo.listActive()).not.toContainEqual(
      expect.objectContaining({ id: bench.id }),
    )
    expect(await exerciseRepo.get(bench.id)).toEqual({
      id: bench.id,
      name: 'Bench Press',
      archived: true,
    })
    expect(await exerciseRepo.listAll()).toContainEqual(
      expect.objectContaining({ id: bench.id }),
    )
  })
})

describe('backupRepo', () => {
  it('round-trips data through export and import', async () => {
    await setUpTemplate()
    const exported = await backupRepo.exportAll()

    expect(exported.version).toBe(BACKUP_VERSION)
    expect(exported.exercises).toHaveLength(2)
    expect(exported.templates).toHaveLength(1)

    await db.exercises.clear()
    await db.templates.clear()
    await backupRepo.importAll(exported)

    expect(await exerciseRepo.listAll()).toHaveLength(2)
    expect(await templateRepo.list()).toHaveLength(1)
  })

  it('import replaces existing data rather than merging it', async () => {
    await setUpTemplate()
    const backup = await backupRepo.exportAll()

    const extra = await exerciseRepo.create('Extra Exercise Not In Backup')
    await backupRepo.importAll(backup)

    expect(await exerciseRepo.get(extra.id)).toBeUndefined()
    expect(await exerciseRepo.listAll()).toHaveLength(2)
  })

  it('rejects a backup with an unsupported version', async () => {
    const backup = await backupRepo.exportAll()
    await expect(
      backupRepo.importAll({ ...backup, version: 999 as typeof BACKUP_VERSION }),
    ).rejects.toThrow(/unsupported backup version/i)
  })

  it('rejects a malformed backup and leaves existing data untouched', async () => {
    await setUpTemplate()

    await expect(
      backupRepo.importAll({ version: BACKUP_VERSION, exercises: 'not-an-array' }),
    ).rejects.toThrow(/missing required data/i)

    expect(await exerciseRepo.listAll()).toHaveLength(2)
    expect(await templateRepo.list()).toHaveLength(1)
  })

  it('rejects a file that is not a backup object at all', async () => {
    await expect(backupRepo.importAll(null)).rejects.toThrow(/not a valid workouts backup/i)
    await expect(backupRepo.importAll('just a string')).rejects.toThrow(
      /not a valid workouts backup/i,
    )
  })
})

describe('deleting a template with logged sessions', () => {
  it('keeps the session and its data resolvable after the template is removed', async () => {
    const { bench, template } = await setUpTemplate()
    const session = await sessionRepo.start(template.id)
    await sessionRepo.patchSet(session.id, 0, 0, { weight: 70, reps: 8 })
    await sessionRepo.finish(session.id)

    await templateRepo.remove(template.id)

    expect(await templateRepo.get(template.id)).toBeUndefined()
    const persisted = await sessionRepo.get(session.id)
    expect(persisted?.exercises[0]).toEqual({
      id: expect.any(String),
      exerciseId: bench.id,
      sets: [
        { id: expect.any(String), weight: 70, reps: 8, note: '' },
        { id: expect.any(String), weight: null, reps: null, note: '' },
        { id: expect.any(String), weight: null, reps: null, note: '' },
      ],
    })
    expect(await exerciseRepo.get(bench.id)).toEqual(bench)
  })
})

describe('archiving an exercise still referenced by a template', () => {
  it('leaves the template item untouched and the exercise resolvable', async () => {
    const { bench, template } = await setUpTemplate()

    await exerciseRepo.archive(bench.id)

    const templateAfter = await templateRepo.get(template.id)
    expect(templateAfter?.items[0].exerciseId).toBe(bench.id)
    expect(await exerciseRepo.get(bench.id)).toEqual({ ...bench, archived: true })
  })
})
