import { NavLink } from 'react-router-dom'
import styles from './TabBar.module.css'
import { HomeIcon, ListIcon, PlayIcon } from './icons'
import { useInProgressSession } from './useInProgressSession'

export function TabBar() {
  const inProgress = useInProgressSession()

  return (
    <nav className={styles.bar}>
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
      >
        <HomeIcon size={25} />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/templates"
        className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
      >
        <ListIcon size={25} />
        <span>Templates</span>
      </NavLink>
      {inProgress && (
        <NavLink
          to={`/session/${inProgress.id}`}
          className={({ isActive }) =>
            `${styles.tab} ${styles.resumeTab} ${isActive ? styles.active : ''}`
          }
        >
          <PlayIcon size={25} />
          <span>In Progress</span>
        </NavLink>
      )}
    </nav>
  )
}
