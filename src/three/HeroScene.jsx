import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Trike, { BOX } from './Trike'
import Parcel from './Parcel'

const { clamp, lerp, damp } = THREE.MathUtils
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

const DRIVE_IN = 7 // koliko metara trokolica prelazi pri ulasku

// compact: telefon/tablet, scena ima svoj prostor između teksta i kartice, trokolica je u sredini
function Scene({ progress, compact }) {
  const { size, camera, viewport, invalidate } = useThree()
  const wide = !compact && size.width / size.height > 1.05
  // u compact režimu ide putanjom kao na širokom ekranu (blaži let paketa, kamera bliže)
  const far = wide || compact
  // na širem ekranu trokolica stoji desno; pomeraj i veličina prate širinu kadra
  const vw = viewport.width

  const rig = useRef()
  const turn = useRef()
  const drive = useRef()
  const parcel = useRef()
  const parts = useRef({})
  const p = useRef(0)
  const start = useRef(null)
  const skipIntro = useRef(reduceMotion())

  useEffect(() => {
    camera.lookAt(0, 0.1, 0)
  }, [camera])

  // scena se crta samo kad se nešto menja (skrol ili ulazak), ne 60-120 puta u sekundi bez potrebe
  useEffect(() => progress.on('change', () => invalidate()), [progress, invalidate])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (start.current === null) start.current = t
    // posle pauze delta može biti velika; ograničena je da pokret ostane gladak
    const dt = Math.min(delta, 1 / 30)

    // 1) ulazak: trokolica dolazi sa strane i koči
    const raw = skipIntro.current ? 1 : clamp((t - start.current - 0.2) / 2.4, 0, 1)
    const intro = 1 - Math.pow(1 - raw, 3)

    // skrol animacija čeka da trokolica uđe i stane (inače brz skrol na telefonu
    // otvori vrata i izbaci paket dok trokolica još ulazi)
    const target = progress.get() * smooth(0.85, 1, raw)
    p.current = damp(p.current, target, 4, dt)
    const s = p.current
    const dist = (intro - 1) * DRIVE_IN
    drive.current.position.x = dist
    // malo "propinjanje" pri kočenju
    drive.current.rotation.z = -Math.sin(raw * Math.PI) * 0.02 * (1 - raw)
    parts.current.wheels?.forEach((w) => w && (w.rotation.z = -dist / w.userData.radius))

    // 2) skrol: trokolica se okreće od prednje ka zadnjoj strani
    turn.current.rotation.y = lerp(-0.6, 0.78, smooth(0, 0.45, s))

    // 3) zadnja vrata kutije se podižu
    const hatch = smooth(0.42, 0.6, s)
    if (parts.current.hatch) parts.current.hatch.rotation.z = -hatch * 1.95

    // 4) paket izlazi i dolazi ka kameri
    const k = smooth(0.56, 0.97, s)
    const slide = smooth(0, 0.4, k)
    const fly = smooth(0.3, 1, k)
    const box = parcel.current
    box.visible = k > 0.001
    // na uskom ekranu paket ide više pravo ka kameri, da ostane u kadru
    box.position.set(
      BOX.x + 0.02 - slide * 0.85 - fly * (wide ? 1.4 : compact ? 0.15 : 0.3),
      BOX.y + 0.31 + fly * (wide ? 0.4 : compact ? 0.05 : 0.75) + Math.sin(t * 1.5) * 0.02 * fly,
      fly * (wide ? 1.3 : compact ? 0.9 : 1.6),
    )
    box.rotation.set(fly * 0.12, fly * (far ? 0.95 : 0.8), -fly * 0.06)
    box.scale.setScalar(0.7 * (1 + fly * (compact ? 0.15 : far ? 0.35 : 0.7)))

    // kamera se lagano primiče
    // na telefonu kamera stoji, da trokolica ne izađe iz svog prostora
    camera.position.z = compact ? 8.4 : lerp(far ? 8 : 9.5, far ? 7.3 : 8.6, smooth(0.2, 1, s))
    camera.lookAt(0, 0.1, 0)

    // traži sledeći frejm samo dok animacija još traje
    if (raw < 1 || Math.abs(target - s) > 0.0005) invalidate()
  })

  // compact: trokolica (oko 2,6 x 1,9 m sa paketom) staje u kadar i po širini i po visini
  const fit = Math.min(viewport.width / 2.8, viewport.height / 2.1)
  const rigPos = compact ? [0, 0.1 - 0.8 * fit, 0] : wide ? [vw * 0.19, -0.7, 0] : [0, -0.85, 0]
  const rigScale = compact ? fit : wide ? Math.min(1.3, vw * 0.17) : Math.min(1.1, vw * 0.36)

  return (
    <group ref={rig} position={rigPos} scale={rigScale}>
      <group ref={turn}>
        <group ref={drive}>
          <BlobShadow />
          <Trike parts={parts} />
          <group ref={parcel} visible={false}>
            <Parcel />
          </group>
        </group>
      </group>
    </group>
  )
}

// active: crta se samo dok je početni ekran vidljiv, inače scena stoji i ne troši procesor
/** Meka senka ispod trokolice: jedna providna ploča umesto senke koja se računa svaki frejm. */
function BlobShadow() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(0.45, 'rgba(0,0,0,.65)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[-0.05, 0.004, 0]} renderOrder={-1}>
      <planeGeometry args={[2.9, 1.25]} />
      <meshBasicMaterial map={texture} transparent opacity={0.85} depthWrite={false} />
    </mesh>
  )
}

export default function HeroScene({ progress, active = true, compact = false }) {
  return (
    <Canvas frameloop={active ? 'demand' : 'never'} dpr={[1, 1.5]} camera={{ position: [0, 1.3, 8], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#ffd5c8" />
      <Scene progress={progress} compact={compact} />
      {/* "studijska" svetla za odsjaje na farbi, bez preuzimanja HDR fajlova */}
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={2} position={[0, 2, 6]} scale={[10, 0.6, 1]} />
        <Lightformer intensity={1.5} position={[0, 0.6, 6]} scale={[10, 0.3, 1]} />
        <Lightformer intensity={1.2} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer intensity={1} color="#ffcfc4" position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>
    </Canvas>
  )
}
