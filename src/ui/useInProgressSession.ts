import { useLiveQuery } from 'dexie-react-hooks'
import { sessionRepo } from '../db'

/** The single in-progress session, if any. `undefined` while loading or none exists. */
export function useInProgressSession() {
  return useLiveQuery(() => sessionRepo.getInProgress(), [])
}
