import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'
import { ChevronLeftIcon, GearIcon } from './icons'

type HeaderProps = {
  title: string
  back?: boolean
  showSettings?: boolean
}

export function Header({ title, back, showSettings }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className={styles.header}>
      <div className={styles.side}>
        {back && (
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <ChevronLeftIcon />
          </button>
        )}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.side}>
        {showSettings && (
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Settings"
            onClick={() => navigate('/settings')}
          >
            <GearIcon />
          </button>
        )}
      </div>
    </header>
  )
}
