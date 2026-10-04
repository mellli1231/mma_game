import { ToastHost } from './components'
import AppRoutes from './routes'
import { useGameState } from './store'

export default function App() {
  const state = useGameState()
  return (
    <>
      {state ? <AppRoutes /> : <div className="p-6 text-muted">Loading...</div>}
      <ToastHost />
    </>
  )
}
