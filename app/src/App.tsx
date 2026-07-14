import { useState } from 'react'
import { Portals } from './portals/Portals'
import { ErrorBoundary } from './portals/ErrorBoundary'
import { SplashScreen } from './portals/chrome/SplashScreen'

function App() {
  // Splash shows on every load by design (no persistence) — it's the demo's front door.
  const [entered, setEntered] = useState(false)

  return (
    <ErrorBoundary>
      <Portals />
      {!entered && <SplashScreen onDismiss={() => setEntered(true)} />}
    </ErrorBoundary>
  )
}

export default App
