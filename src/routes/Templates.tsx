import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Header } from '../ui/Header'
import { PlusIcon } from '../ui/icons'
import { templateRepo } from '../db'
import { pluralize } from '../lib/pluralize'
import styles from './Templates.module.css'

export function Templates() {
  const navigate = useNavigate()
  const templates = useLiveQuery(() => templateRepo.list(), [])

  return (
    <>
      <Header title="Templates" showSettings />
      <div className={styles.content}>
        {templates && templates.length === 0 && (
          <div className={styles.empty}>
            <p>No templates yet. Create one to start logging workouts.</p>
          </div>
        )}
        {templates && templates.length > 0 && (
          <div className={styles.list}>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={styles.item}
                onClick={() => navigate(`/templates/${template.id}`)}
              >
                <span className={styles.itemName}>{template.name}</span>
                <span className={styles.itemCount}>
                  {pluralize(template.items.length, 'exercise')}
                </span>
              </button>
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
