import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PROGRAM from '../radio.json'
import cover from '../assets/beep-beep-ptica.webp'

/**
 * Beep Beep radio: sopstveni program (pesme iz public/radio/pesme i džinglovi iz public/radio/dzinglovi,
 * spisak pravi `npm run radio`). Radi kao prava stanica: program teče po satu, pa svi slušaoci u istom
 * trenutku čuju istu pesmu, a ko uključi radio upada usred pesme koja upravo ide.
 * Plejer je ovde (ne na stranici /radio), pa muzika svira i dok kupac ide sa stranice na stranicu.
 */

// od kog trenutka program "teče" (sekunde)
const EPOCH = Date.UTC(2026, 0, 1) / 1000
// posle koliko pesama ide džingl
const SONGS_PER_JINGLE = 2
export const STATION = { key: 'beep', label: 'Uživo' }

const base = import.meta.env.BASE_URL || '/'
const urlOf = (file) => base + file.split('/').map(encodeURIComponent).join('/')

/** Isti "nasumičan" redosled za sve slušaoce u istom krugu programa. */
function shuffled(list, seed) {
  const out = [...list]
  let s = seed * 9301 + 49297
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Jedan krug programa: pesme izmešane za taj krug, posle svake dve pesme džingl. */
function round(index) {
  const { songs, jingles } = PROGRAM
  if (!songs.length) return jingles.map((j) => ({ ...j, kind: 'jingle' }))
  const items = []
  shuffled(songs, index).forEach((song, i) => {
    items.push({ ...song, kind: 'song' })
    if (jingles.length && (i + 1) % SONGS_PER_JINGLE === 0) items.push({ ...jingles[(index * 7 + i) % jingles.length], kind: 'jingle' })
  })
  return items
}
const ROUND_LENGTH = round(0).reduce((sum, item) => sum + item.duration, 0)

/** Šta ide u ovom trenutku: stavka programa, koliko sekundi je već prošlo od nje, i šta sledi. */
export function onAir(now = Date.now() / 1000) {
  if (!ROUND_LENGTH) return null
  const elapsed = now - EPOCH
  const index = Math.floor(elapsed / ROUND_LENGTH)
  let t = elapsed - index * ROUND_LENGTH
  const items = round(index)
  for (let i = 0; i < items.length; i++) {
    if (t < items[i].duration) return { item: items[i], offset: t, next: items[i + 1] ?? round(index + 1)[0] }
    t -= items[i].duration
  }
  return { item: items[0], offset: 0, next: items[1] }
}

export const hasProgram = ROUND_LENGTH > 0
export const hasSongs = PROGRAM.songs.length > 0

const RadioContext = createContext(null)

export function RadioProvider({ children }) {
  const [station, setStation] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolumeState] = useState(70)
  const [error, setError] = useState('')
  const [track, setTrack] = useState(null)
  const audio = useRef(null)
  const wanted = useRef(false)

  // plejer (jedan audio element za ceo sajt)
  const prepare = useCallback(() => {
    if (audio.current || typeof Audio === 'undefined') return
    const a = new Audio()
    a.preload = 'auto'
    a.volume = 0.7
    a.addEventListener('playing', () => {
      setPlaying(true)
      setError('')
    })
    a.addEventListener('pause', () => setPlaying(false))
    // kraj stavke: odmah ide ono što je po satu sledeće
    a.addEventListener('ended', () => wanted.current && tune())
    a.addEventListener('error', () => {
      if (!wanted.current) return
      setError('Radio trenutno ne može da se pusti. Pokušavamo ponovo…')
      setTimeout(() => wanted.current && tune(), 3000)
    })
    audio.current = a
  }, [])

  // uključi ono što je trenutno "u etru", od trenutka u kom je (kao pravi radio)
  const tune = useCallback(() => {
    prepare()
    const a = audio.current
    const now = onAir()
    if (!a || !now) {
      setError('Program još nije spreman.')
      return
    }
    const { item, next } = now
    // pesma se uključuje od mesta gde je "u etru", a džingl (špica) uvek od početka, da se čuje ceo
    const offset = item.kind === 'jingle' ? 0 : now.offset
    setTrack({ ...item, next })
    // #t= kaže pregledaču odakle da krene (radi i na telefonima, u istom dodiru)
    a.src = offset > 0.5 ? `${urlOf(item.file)}#t=${offset.toFixed(1)}` : urlOf(item.file)
    a.play().catch(() => {
      if (wanted.current) setPlaying(false)
    })
    // podaci za zaključan ekran telefona i slušalice
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.kind === 'song' ? item.title : 'Beep Beep radio',
        artist: item.kind === 'song' ? item.artist : 'Beep Beep dostava, Negotin',
        album: 'Beep Beep radio',
        artwork: [{ src: cover, sizes: '512x512', type: 'image/webp' }],
      })
    }
  }, [prepare])

  // dugmad na zaključanom ekranu i slušalicama
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play', () => {
      wanted.current = true
      tune()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      wanted.current = false
      audio.current?.pause()
    })
  }, [tune])

  const play = useCallback(() => {
    wanted.current = true
    setStation(STATION)
    setError('')
    tune()
  }, [tune])

  const value = useMemo(
    () => ({
      station,
      playing,
      volume,
      error,
      track,
      prepare,
      play,
      toggle: () => {
        if (playing) {
          wanted.current = false
          audio.current?.pause()
        } else play()
      },
      setVolume: (v) => {
        setVolumeState(v)
        if (audio.current) audio.current.volume = v / 100
      },
    }),
    [station, playing, volume, error, track, prepare, play],
  )

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>
}

export const useRadio = () => useContext(RadioContext)
