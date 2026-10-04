import AppRoutes from './routes'
import { useGameState } from './store'

export default function App() {
  const state = useGameState()
  if (!state) return null
  return <AppRoutes />
}
