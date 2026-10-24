import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

/** Poziv API-ja; greška sa servera postaje Error sa porukom za korisnika. */
export async function apiCall(path, { method = 'GET', body } = {}) {
  // probna verzija na GitHub Pages nema server
  if (import.meta.env.VITE_STATIC_DEMO) {
    throw new Error('Ovo je probna verzija sajta: registracija, prijava i porudžbine rade na pravom sajtu.')
  }
  let res
  try {
    res = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    })
  } catch {
    throw new Error('Nema veze sa serverom. Proverite internet i pokušajte ponovo.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Nešto nije u redu. Pokušajte ponovo.')
  return data
}

export function AuthProvider({ children }) {
  // undefined = još se proverava, null = nije prijavljen
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    apiCall('/api/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
  }, [])

  const login = useCallback(async (login, password) => setUser((await apiCall('/api/login', { method: 'POST', body: { login, password } })).user), [])
  const register = useCallback(async (data) => setUser((await apiCall('/api/register', { method: 'POST', body: data })).user), [])
  const update = useCallback(async (data) => setUser((await apiCall('/api/me', { method: 'PUT', body: data })).user), [])
  const logout = useCallback(async () => {
    await apiCall('/api/logout', { method: 'POST', body: {} })
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, setUser, login, register, update, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
