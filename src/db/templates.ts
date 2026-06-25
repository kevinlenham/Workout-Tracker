import { db } from './database'
import { newId } from './id'
import type { TemplateItem, WorkoutTemplate } from './types'

async function create(name: string, items: TemplateItem[]): Promise<WorkoutTemplate> {
  const template: WorkoutTemplate = { id: newId(), name, items }
  await db.templates.add(template)
  return template
}

async function update(
  id: string,
  patch: { name?: string; items?: TemplateItem[] },
): Promise<void> {
  await db.templates.update(id, patch)
}

async function remove(id: string): Promise<void> {
  await db.templates.delete(id)
}

async function list(): Promise<WorkoutTemplate[]> {
  return db.templates.toArray()
}

async function get(id: string): Promise<WorkoutTemplate | undefined> {
  return db.templates.get(id)
}

export const templateRepo = { create, update, remove, list, get }
