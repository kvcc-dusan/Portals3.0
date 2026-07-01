import { Portals } from './portals/Portals'
import { ErrorBoundary } from './portals/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Portals />
    </ErrorBoundary>
  )
}

export default App
