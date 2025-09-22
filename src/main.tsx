import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from './app/AppRouter'

import './index.css'

import App from './App'

/* const rootEl = document.getElementById('root')!
createRoot(document.getElementById('root')!).render(<AppRouter />)

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) */


createRoot(document.getElementById('root')!).render(<AppRouter />)
