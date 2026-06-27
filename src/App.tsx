import { Route, Routes } from 'react-router-dom'
import styles from './App.module.css'
import { useLaunchRedirect } from './ui/useLaunchRedirect'
import { Home } from './routes/Home'
import { Templates } from './routes/Templates'
import { TemplateEditor } from './routes/TemplateEditor'
import { Session } from './routes/Session'
import { Settings } from './routes/Settings'

function App() {
  useLaunchRedirect()

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/new" element={<TemplateEditor />} />
          <Route path="/templates/:id" element={<TemplateEditor />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
