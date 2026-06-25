import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useInProgressSession } from './useInProgressSession'

/** On cold launch only, jumps straight into an in-progress session if one exists. */
export function useLaunchRedirect() {
  const inProgress = useInProgressSession()
  const navigate = useNavigate()
  const location = useLocation()
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current || inProgress === undefined) return
    checked.current = true
    if (inProgress && location.pathname === '/') {
      navigate(`/session/${inProgress.id}`, { replace: true })
    }
  }, [inProgress, location.pathname, navigate])
}
