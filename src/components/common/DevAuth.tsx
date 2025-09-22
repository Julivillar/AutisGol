import { useEffect, useState } from 'react'
import { auth } from '../../services/firebase/client'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export function DevAuth() {
  const [email, setEmail] = useState('julvillce@gmail.com')
  const [password, setPassword] = useState('Password123!')
  const [user, setUser] = useState(() => auth.currentUser)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u))
    return () => unsub()
  }, [])

  if (!import.meta.env.DEV) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      {user ? (
        <>
          <span className="text-gray-600">DEV auth: {user.email}</span>
          <button className="px-2 py-1 border rounded" onClick={() => signOut(auth)}>Salir</button>
        </>
      ) : (
        <form
          className="flex items-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            await signInWithEmailAndPassword(auth, email, password)
          }}
        >
          <input className="border px-2 py-1 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="border px-2 py-1 rounded" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="px-2 py-1 border rounded bg-white">Entrar</button>
        </form>
      )}
    </div>
  )
}