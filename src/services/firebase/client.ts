// src/services/firebase/client.ts
import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore'
import {
  getAuth,
  connectAuthEmulator
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
}

export const app = getApps()[0] ?? initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)

// Usa los emuladores solo en desarrollo local
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    // Opcional: console.info('Conectado a emuladores')
  } catch {
    // noop si ya estuvieran conectados
  }
}
