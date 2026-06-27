import { Route, Routes, useLocation } from 'react-router-dom'
import styles from './App.module.css'
import { TabBar } from './ui/TabBar'
import { useLaunchRedirect } from './ui/useLaunchRedirect'
import { Home } from './routes/Home'
import { Templates } from './routes/Templates'
import { TemplateEditor } from './routes/TemplateEditor'
import { Session } from './routes/Session'
import { Settings } from './routes/Settings'

const TAB_ROOTS = ['/', '/templates']

function App() {
  useLaunchRedirect()
  const location = useLocation()
  const showTabBar = TAB_ROOTS.includes(location.pathname)

  return (
    <div className={styles.app}>
      <main
        className={styles.main}
        style={{ paddingBottom: showTabBar ? 'var(--tab-bar-shell-height)' : 0 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/new" element={<TemplateEditor />} />
          <Route path="/templates/:id" element={<TemplateEditor />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {showTabBar && <TabBar />}
    </div>
  )
}

export default App
