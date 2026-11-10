import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PROGRAM from '../radio.json'
import cover from '../assets/beep-beep-ptica.webp'

/**
 * Beep Beep radio: četiri stanice (RADIO u data.js).
 * - Naše stanice ('own'): pesme iz public/radio/pesme/<stanica> i naša špica posle svake dve pesme. Program teče po
 *   satu, pa svi slušaoci iste stanice u istom trenutku čuju istu pesmu (špica uvek kreće od početka).
 * - YouTube stanice ('youtube'): plejlista ili prenos uživo. Po YouTube pravilima plejer mora da se vidi (najmanje
 *   200 x 200), pa YouTube video stoji u kartici na stranici /radio (ytSlot), a kad kupac ode sa te stranice,
 *   YouTube stanica staje.
 * Plejer za naše stanice je ovde (ne na stranici /radio), pa one sviraju i dok kupac ide sa stranice na stranicu.
 */

// od kog trenutka program "teče" (sekunde) i posle koliko pesama ide špica
const EPOCH = Date.UTC(2026, 0, 1) / 1000
const SONGS_PER_JINGLE = 2

const base = import.meta.env.BASE_URL || '/'
const urlOf = (file) => base + file.split('/').map(encodeURIComponent).join('/')

// ---------------- naše stanice: program po satu ----------------

/** Isti "nasumičan" redosled za sve slušaoce u istom krugu programa. */
function shuffled(list, seed) {
  const out = [...list]
  let s = (seed * 9301 + 49297) % 233280
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Jedan krug programa stanice: pesme izmešane za taj krug, posle svake dve pesme špica. */
function round(key, index) {
  const songs = PROGRAM.stations[key] ?? []
  const jingles = PROGRAM.jingles.map((j) => ({ ...j, kind: 'jingle' }))
  if (!songs.length) return jingles
  const items = []
  shuffled(songs, index).forEach((song, i) => {
    items.push({ ...song, kind: 'song' })
    if (jingles.length && (i + 1) % SONGS_PER_JINGLE === 0) items.push(jingles[(index * 7 + i) % jingles.length])
  })
  return items
}

/** Šta je na stanici u ovom trenutku: stavka, koliko je od nje prošlo, i šta sledi. */
export function onAir(key, now = Date.now() / 1000) {
  const length = round(key, 0).reduce((sum, item) => sum + item.duration, 0)
  if (!length) return null
  const elapsed = now - EPOCH
  const index = Math.floor(elapsed / length)
  let t = elapsed - index * length
  const items = round(key, index)
  for (let i = 0; i < items.length; i++) {
    if (t < items[i].duration) return { item: items[i], offset: t, next: items[i + 1] ?? round(key, index + 1)[0] }
    t -= items[i].duration
  }
  return { item: items[0], offset: 0, next: items[1] }
}

export const songCount = (key) => (PROGRAM.stations[key] ?? []).length

// ---------------- YouTube ----------------

// YouTube IFrame API se učitava tek kad neko prvi put pusti YouTube stanicu (ne usporava sajt)
let apiPromise
function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  apiPromise ||= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  })
  return apiPromise
}

/** Naslov i kanal trenutnog YouTube snimka. */
function readTrack(p) {
  const data = p.getVideoData?.()
  if (!data?.title) return null
  return { kind: 'song', title: data.title, artist: data.author }
}

// ---------------- jedan plejer za ceo sajt ----------------

const RadioContext = createContext(null)

export function RadioProvider({ children }) {
  const [station, setStation] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolumeState] = useState(70)
  const [error, setError] = useState('')
  const [track, setTrack] = useState(null)
  const audio = useRef(null)
  const yt = useRef(null)
  const ytReady = useRef(false)
  const pendingYt = useRef(null)
  const shuffledYt = useRef(true)
  const wanted = useRef(false)
  const current = useRef(null)
  const volumeRef = useRef(volume)
  const host = useRef(null)

  // ---- naše stanice (HTML audio) ----
  const tune = useCallback(() => {
    const s = current.current
    const a = audio.current
    const now = s && onAir(s.key)
    if (!a || !now) return setError('Ova stanica još nema program.')
    const { item, next } = now
    // pesma se uključuje od mesta gde je "u etru", a špica uvek od početka, da se čuje cela
    const offset = item.kind === 'jingle' ? 0 : now.offset
    setTrack({ ...item, next })
    a.src = offset > 0.5 ? `${urlOf(item.file)}#t=${offset.toFixed(1)}` : urlOf(item.file)
    a.play().catch(() => wanted.current && setPlaying(false))
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.kind === 'song' ? item.title : 'Beep Beep radio',
        artist: item.kind === 'song' ? item.artist : 'Beep Beep dostava, Negotin',
        album: `Beep Beep ${s.label}`,
        artwork: [{ src: cover, sizes: '512x512', type: 'image/webp' }],
      })
    }
  }, [])

  const prepareAudio = () => {
    if (audio.current || typeof Audio === 'undefined') return
    const a = new Audio()
    a.preload = 'auto'
    a.volume = volumeRef.current / 100
    a.addEventListener('playing', () => {
      setPlaying(true)
      setError('')
    })
    a.addEventListener('pause', () => current.current?.type === 'own' && setPlaying(false))
    // kraj stavke: odmah ide ono što je po satu sledeće
    a.addEventListener('ended', () => wanted.current && current.current?.type === 'own' && tune())
    a.addEventListener('error', () => {
      if (!wanted.current || current.current?.type !== 'own' || !a.src) return
      setError('Stanica trenutno ne može da se pusti. Pokušavamo ponovo…')
      setTimeout(() => wanted.current && current.current?.type === 'own' && tune(), 3000)
    })
    audio.current = a
  }

  // ---- YouTube stanice ----
  const playYt = useCallback((s) => {
    if (!ytReady.current) {
      pendingYt.current = s
      return
    }
    pendingYt.current = null
    const p = yt.current
    if (s.yt.list) {
      // plejlista: kreće od prve, a čim krene izmeša se i skoči na nasumičnu pesmu
      shuffledYt.current = false
      p.mute()
      p.loadPlaylist({ list: s.yt.list, listType: 'playlist', index: 0 })
    } else {
      p.unMute()
      p.loadVideoById(s.yt.video)
    }
    p.setLoop?.(true)
    p.playVideo()
  }, [])

  const prepareYt = useCallback(() => {
    if (yt.current || !host.current) return
    yt.current = 'loading'
    loadYouTube().then((YT) => {
      // u međuvremenu se možda otišlo sa stranice radija
      if (!host.current) {
        yt.current = null
        return
      }
      // YouTube zamenjuje element svojim iframe-om, zato se pravi van React-a
      const el = document.createElement('div')
      host.current.appendChild(el)
      yt.current = new YT.Player(el, {
        width: 200,
        height: 200,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 0, controls: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (e) => {
            ytReady.current = true
            e.target.setVolume(volumeRef.current)
            if (pendingYt.current) playYt(pendingYt.current)
          },
          onStateChange: (e) => {
            if (current.current?.type !== 'youtube') return
            const on = e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING
            if (e.data === YT.PlayerState.PLAYING && !wanted.current) {
              e.target.pauseVideo()
              return setPlaying(false)
            }
            setPlaying(wanted.current && on)
            if (e.data === YT.PlayerState.PLAYING) {
              setError('')
              const list = e.target.getPlaylist?.()
              if (!shuffledYt.current && list?.length > 1) {
                shuffledYt.current = true
                e.target.setShuffle(true)
                e.target.playVideoAt(Math.floor(Math.random() * list.length))
                return
              }
              if (e.target.isMuted()) e.target.unMute()
              setTrack(readTrack(e.target))
            }
          },
          onError: (e) => {
            // u plejlisti neka pesma može biti obrisana ili blokirana: preskoči je
            const list = e.target.getPlaylist?.()
            if (list?.length > 1 && e.target.getPlaylistIndex() < list.length - 1) return e.target.nextVideo()
            setPlaying(false)
            setError('Ova stanica trenutno ne radi. Izaberite drugu.')
          },
        },
      })
    })
  }, [playYt])

  // mesto za YouTube video u kartici na stranici /radio. Kad se ode sa te stranice, plejer nestaje i YouTube stanica staje.
  const ytSlot = useCallback((el) => {
    if (el) {
      host.current = el
      return
    }
    if (yt.current && yt.current !== 'loading') yt.current.destroy?.()
    yt.current = null
    ytReady.current = false
    host.current = null
    if (current.current?.type === 'youtube') {
      wanted.current = false
      setPlaying(false)
      setTrack(null)
    }
  }, [])

  // naslov sa YouTube-a se osvežava dok svira (plejlista prelazi na sledeću pesmu)
  useEffect(() => {
    if (!playing || station?.type !== 'youtube') return
    const id = setInterval(() => ytReady.current && setTrack(readTrack(yt.current)), 5000)
    return () => clearInterval(id)
  }, [playing, station])

  // plejer se sprema čim kupac krene ka radiju (telefoni traže da puštanje počne baš na dodir)
  const prepare = useCallback(() => {
    prepareAudio()
    prepareYt()
  }, [prepareYt])

  const stopAll = () => {
    audio.current?.pause()
    if (ytReady.current) yt.current.pauseVideo()
  }

  const play = useCallback(
    (s) => {
      prepare()
      wanted.current = true
      current.current = s
      setStation(s)
      setError('')
      setTrack(null)
      if (s.type === 'youtube') {
        audio.current?.pause()
        playYt(s)
      } else {
        if (ytReady.current) yt.current.pauseVideo()
        tune()
      }
    },
    [prepare, playYt, tune],
  )

  // dugmad na zaključanom ekranu i slušalicama (naše stanice)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play', () => current.current && play(current.current))
    navigator.mediaSession.setActionHandler('pause', () => {
      wanted.current = false
      stopAll()
    })
  }, [play])

  const value = useMemo(
    () => ({
      station,
      playing,
      volume,
      error,
      track,
      prepare,
      play,
      ytSlot,
      toggle: () => {
        if (playing) {
          wanted.current = false
          stopAll()
          setPlaying(false)
        } else if (station) play(station)
      },
      stop: () => {
        wanted.current = false
        stopAll()
        setPlaying(false)
        setStation(null)
        current.current = null
        setTrack(null)
      },
      setVolume: (v) => {
        setVolumeState(v)
        volumeRef.current = v
        if (audio.current) audio.current.volume = v / 100
        if (ytReady.current) yt.current.setVolume(v)
      },
    }),
    [station, playing, volume, error, track, prepare, play, ytSlot],
  )

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>
}

export const useRadio = () => useContext(RadioContext)
