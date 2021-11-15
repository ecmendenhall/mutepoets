import { useEffect, useState } from 'react'
import Routes from './routes'

export function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setIsReady(true))
  }, [])

  return <div>{isReady && <Routes />}</div>
}

export default App
