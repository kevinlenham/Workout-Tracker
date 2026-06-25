import styles from './Stepper.module.css'

type StepperProps = {
  value: number
  min?: number
  onChange: (value: number) => void
}

export function Stepper({ value, min = 1, onChange }: StepperProps) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.button}
        disabled={value <= min}
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        className={styles.button}
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
