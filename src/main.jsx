import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hasPersistedTabSession } from './store/fileStore'
import { isLaunchTabRequest } from './utils/newFileTab'
import { purgeStaleTabArtifacts } from './utils/filePersistence'

if (!hasPersistedTabSession() && !isLaunchTabRequest()) {
  purgeStaleTabArtifacts()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
