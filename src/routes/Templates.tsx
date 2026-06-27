import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Header } from '../ui/Header'
import { TabBar } from '../ui/TabBar'
import { PlayIcon, PlusIcon } from '../ui/icons'
import { sessionRepo, templateRepo } from '../db'
import { pluralize } from '../lib/pluralize'
import { useInProgressSession } from '../ui/useInProgressSession'
import styles from './Templates.module.css'

export function Templates() {
  const navigate = useNavigate()
  const templates = useLiveQuery(() => templateRepo.list(), [])
  const inProgress = useInProgressSession()

  async function handleStart(templateId: string) {
    const session = await sessionRepo.start(templateId)
    navigate(`/session/${session.id}`)
  }

  return (
    <>
      <Header title="Templates" showSettings />
      <TabBar />
      <div className={styles.content}>
        {templates && templates.length === 0 && (
          <div className={styles.empty}>
            <p>No templates yet. Create one to start logging workouts.</p>
          </div>
        )}
        {templates && templates.length > 0 && (
          <div className={styles.list}>
            {templates.map((template) => (
              <div
                key={template.id}
                className={styles.item}
              >
                <button
                  type="button"
                  className={styles.itemOpen}
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  <span className={styles.itemName}>{template.name}</span>
                  <span className={styles.itemCount}>
                    {pluralize(template.items.length, 'exercise')}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.startButton}
                  aria-label={`Start ${template.name}`}
                  disabled={template.items.length === 0 || Boolean(inProgress)}
                  onClick={() => handleStart(template.id)}
                >
                  <PlayIcon size={18} />
                  <span>Start</span>
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className={styles.newButton}
          onClick={() => navigate('/templates/new')}
        >
          <PlusIcon size={18} />
          New template
        </button>
      </div>
    </>
  )
}
