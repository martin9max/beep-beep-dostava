import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// YouTube IFrame API se učitava tek kad kupac prvi put dođe do radija (ne usporava sajt).
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

/** Naslov i kanal trenutnog videa sa YouTube plejera; kod plejliste i koja je pesma po redu. */
function readTrack(p) {
  const data = p.getVideoData?.()
  if (!data?.title) return null
  const list = p.getPlaylist?.() ?? []
  return {
    id: data.video_id,
    title: data.title,
    author: data.author,
    index: (p.getPlaylistIndex?.() ?? 0) + 1,
    total: list.length,
  }
}

const RadioContext = createContext(null)

/**
 * Beep Beep radio za ceo sajt: plejer je ovde (ne na stranici /radio), pa muzika svira i dok
 * kupac ide sa stranice na stranicu. Stanice (YouTube video/plejliste) su u data.js, RADIO.
 */
export function RadioProvider({ children }) {
  const [station, setStation] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolumeState] = useState(70)
  const [error, setError] = useState('')
  // šta trenutno svira (naslov i kanal sa YouTube-a; za plejlistu i redni broj pesme)
  const [track, setTrack] = useState(null)
  const player = useRef(null)
  const ready = useRef(false)
  const pending = useRef(null)
  const shuffled = useRef(true)
  // da li kupac želi da svira: posle pauze YouTube zna sam da nastavi (pesma se još učitavala,
  // skok na nasumičnu pesmu), pa se to proverava pri svakom početku sviranja
  const wanted = useRef(false)
  const volumeRef = useRef(volume)
  const host = useRef(null)

  // naslov se osvežava dok svira (plejlista prelazi na sledeću pesmu, prenos uživo menja naslov)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => ready.current && setTrack(readTrack(player.current)), 5000)
    return () => clearInterval(id)
  }, [playing])

  const play = useCallback((s) => {
    wanted.current = true
    setStation(s)
    setError('')
    setTrack(null)
    if (!ready.current) {
      pending.current = s
      return
    }
    pending.current = null
    const p = player.current
    if (s.type === 'playlist') {
      // svaki posetilac počinje od druge pesme, a posle ide nasumičnim redom
      shuffled.current = false
      p.mute()
      p.loadPlaylist({ list: s.id, listType: 'playlist', index: 0 })
    } else {
      p.unMute()
      p.loadVideoById(s.id)
    }
    p.setLoop?.(true)
    p.playVideo()
  }, [])

  // plejer se pravi čim kupac krene ka radiju, da izbor stanice odmah krene (telefoni traže da
  // puštanje počne baš na dodir)
  const prepare = useCallback(() => {
    if (player.current) return
    player.current = 'loading'
    loadYouTube().then((YT) => {
      // YouTube zamenjuje element svojim iframe-om, zato se pravi van React-a
      const el = document.createElement('div')
      host.current.appendChild(el)
      player.current = new YT.Player(el, {
        width: 1,
        height: 1,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
        events: {
          onReady: (e) => {
            ready.current = true
            e.target.setVolume(volumeRef.current)
            if (pending.current) play(pending.current)
          },
          onStateChange: (e) => {
            setPlaying(wanted.current && (e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING))
            if (e.data === YT.PlayerState.PLAYING && !wanted.current) {
              e.target.pauseVideo()
              setPlaying(false)
              return
            }
            if (e.data === YT.PlayerState.PLAYING) {
              setError('')
              // tek kad plejlista krene zna se koliko ima pesama: izmeša se i skoči na nasumičnu
              const list = e.target.getPlaylist?.()
              if (!shuffled.current && list?.length > 1) {
                shuffled.current = true
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
            if (list?.length > 1 && e.target.getPlaylistIndex() < list.length - 1) {
              e.target.nextVideo()
              return
            }
            setPlaying(false)
            setError('Ova stanica trenutno ne radi. Izaberite drugu.')
          },
        },
      })
    })
  }, [play])

  const value = useMemo(() => {
    const p = () => (ready.current ? player.current : null)
    return {
      station,
      playing,
      volume,
      error,
      track,
      prepare,
      play,
      toggle: () => {
        if (!p() || !station) return
        if (playing) {
          wanted.current = false
          p().pauseVideo()
          setPlaying(false)
        } else {
          wanted.current = true
          p().playVideo()
        }
      },
      setVolume: (v) => {
        setVolumeState(v)
        volumeRef.current = v
        p()?.setVolume(v)
      },
    }
  }, [station, playing, volume, error, track, prepare, play])

  return (
    <RadioContext.Provider value={value}>
      {children}
      {/* skriveni YouTube plejer (ne display:none, jer onda ne svira pouzdano) */}
      <div ref={host} className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true" />
    </RadioContext.Provider>
  )
}

export const useRadio = () => useContext(RadioContext)
