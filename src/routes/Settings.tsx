import { useRef, useState } from 'react'
import { Header } from '../ui/Header'
import { backupRepo } from '../db'
import styles from './Settings.module.css'

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

type Message = { text: string; tone: 'success' | 'error' }

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<Message | null>(null)

  async function handleExport() {
    const data = await backupRepo.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workouts-backup-${todayStamp()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ text: 'Backup downloaded.', tone: 'success' })
  }

  async function handleImportFile(file: File) {
    setMessage(null)

    let data: unknown
    try {
      data = JSON.parse(await file.text())
    } catch {
      setMessage({ text: 'That file is not valid JSON.', tone: 'error' })
      return
    }

    const confirmed = window.confirm(
      'This will replace all current data with the contents of this backup. Continue?',
    )
    if (!confirmed) return

    try {
      await backupRepo.importAll(data)
      setMessage({ text: 'Import complete.', tone: 'success' })
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Import failed.', tone: 'error' })
    }
  }

  return (
    <>
      <Header title="Settings" back />
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Backup</h2>
          <p className={styles.hint}>
            Export everything to a JSON file you control, or restore from one. Importing replaces
            all current data.
          </p>
          <button type="button" className={styles.button} onClick={handleExport}>
            Export data
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => fileInputRef.current?.click()}
          >
            Import data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className={styles.hiddenInput}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) handleImportFile(file)
            }}
          />
          {message && (
            <p className={message.tone === 'error' ? styles.messageError : styles.message}>
              {message.text}
            </p>
          )}
        </section>
      </div>
    </>
  )
}
