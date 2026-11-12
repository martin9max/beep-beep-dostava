import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Trike, { BOX } from './Trike'
import Parcel from './Parcel'

const { clamp, lerp, damp } = THREE.MathUtils
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

const TURN_START = -0.6 // trokolica na početku stoji malo okrenuta (prednji deo ka kameri)

// compact: telefon/tablet, scena ima svoj prostor između teksta i kartice, trokolica je u sredini
// trikeSize: veličina trokolice (1 = puna); lower: koliko je spuštena (deo visine kadra), da stoji na putu sa fotografije
// onArrive: poziva se jednom, malo pre nego što trokolica zakoči (za zvuk dolaska)
function Scene({ progress, compact, trikeSize, lower, onArrive }) {
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
  const driveIn = useRef(7)
  const parts = useRef({})
  const p = useRef(0)
  const start = useRef(null)
  const skipIntro = useRef(reduceMotion())
  const arrived = useRef(false)

  useEffect(() => {
    camera.lookAt(0, 0.1, 0)
  }, [camera])

  // prvi frejm odmah kad platno dobije veličinu (na telefonu je na početku prazno, pa bi scena
  // inače čekala prvi skrol, i trokolica bi ulazila tek tada)
  useEffect(() => invalidate(), [size.width, size.height, invalidate])

  // na računaru se dešavalo da prvi frejm propadne (sajt otvoren u kartici iza, pregledač uspori crtanje
  // dok se strana učitava), pa trokolica nije ni ulazila dok se ne skroluje. Zato se crtanje traži još
  // nekoliko puta posle učitavanja i svaki put kad se kartica ili prozor ponovo vide.
  useEffect(() => {
    const timers = [100, 400, 1000, 2000].map((ms) => setTimeout(invalidate, ms))
    const wake = () => document.visibilityState === 'visible' && invalidate()
    document.addEventListener('visibilitychange', wake)
    addEventListener('focus', wake)
    addEventListener('pageshow', wake)
    return () => {
      timers.forEach(clearTimeout)
      document.removeEventListener('visibilitychange', wake)
      removeEventListener('focus', wake)
      removeEventListener('pageshow', wake)
    }
  }, [invalidate])

  // kad se vrati na početni ekran (scena je bila pauzirana), odmah jedan frejm
  const frameloop = useThree((s) => s.frameloop)
  useEffect(() => {
    if (frameloop !== 'never') invalidate()
  }, [frameloop, invalidate])

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
    // zvuk dolaska: tačno kad trokolica stane (posle 85% ulaska pomeraj je manji od milimetra na ekranu)
    if (!arrived.current && !skipIntro.current && raw > 0.85) {
      arrived.current = true
      onArrive?.()
    }

    // skrol animacija čeka da trokolica uđe i stane (inače brz skrol na telefonu
    // otvori vrata i izbaci paket dok trokolica još ulazi)
    const target = progress.get() * smooth(0.85, 1, raw)
    p.current = damp(p.current, target, 4, dt)
    const s = p.current
    const dist = (intro - 1) * driveIn.current
    drive.current.position.x = dist
    // malo "propinjanje" pri kočenju
    drive.current.rotation.z = -Math.sin(raw * Math.PI) * 0.02 * (1 - raw)
    parts.current.wheels?.forEach((w) => w && (w.rotation.z = -dist / w.userData.radius))

    // 2) skrol: trokolica se okreće od prednje ka zadnjoj strani
    turn.current.rotation.y = lerp(TURN_START, 0.78, smooth(0, 0.45, s))

    // 3) zadnja vrata kutije se podižu
    const hatch = smooth(0.42, 0.6, s)
    if (parts.current.hatch) parts.current.hatch.rotation.z = -hatch * 1.95

    // 4) paket izlazi i dolazi ka kameri
    const k = smooth(0.56, 0.97, s)
    const slide = smooth(0, 0.4, k)
    const fly = smooth(0.3, 1, k)
    const box = parcel.current
    box.visible = k > 0.001
    // paket izlazi iz kutije pa leti pravo ka kameri i blago naviše, ostaje na sredini kadra
    // (pomeraj je u koordinatama okrenute trokolice: -x i +z zajedno = ka kameri)
    box.position.set(
      BOX.x + 0.02 - slide * 0.85 - fly * (wide ? 0.2 : compact ? 0.15 : 0.3),
      BOX.y + 0.31 + fly * (wide ? 0.6 : compact ? 0.75 : 0.75) + Math.sin(t * 1.5) * 0.02 * fly,
      fly * (wide ? 1.6 : compact ? 1.2 : 1.6),
    )
    // paket izlazi uspravno (bez naginjanja) i okreće se tačno licem (nalepnicom) ka kameri
    box.rotation.set(0, fly * (Math.PI / 2 - turn.current.rotation.y), 0)
    box.scale.setScalar(0.7 * (1 + fly * (compact ? 0.25 : far ? 0.45 : 0.7)))

    // kamera se lagano primiče
    // na telefonu kamera stoji, da trokolica ne izađe iz svog prostora
    camera.position.z = compact ? 8.4 : lerp(far ? 8 : 9.5, far ? 7.3 : 8.6, smooth(0.2, 1, s))
    camera.lookAt(0, 0.1, 0)

    // traži sledeći frejm samo dok animacija još traje
    if (raw < 1 || Math.abs(target - s) > 0.0005) invalidate()
  })

  // compact: trokolica (oko 2,6 x 1,9 m sa paketom) staje u kadar i po širini i po visini
  const fit = Math.min(viewport.width / 2.8, viewport.height / 2.1)
  // tricikl stoji na sredini, dole na trotoaru sa fotografije u pozadini
  const rigPos = compact
    ? [0, -viewport.height * (0.4 + lower), 0]
    : wide
      ? [0, -viewport.height * (0.39 + lower), 0]
      : [0, -0.85 - viewport.height * lower, 0]
  const rigScale = trikeSize * (compact ? fit * 0.82 : wide ? Math.min(1.35, vw * 0.15) : Math.min(1.1, vw * 0.36))
  // dolazak počinje tačno iza leve ivice slike i završava na sredini
  // (put se meri duž pravca u kom je trokolica okrenuta, zato deljenje sa cos)
  driveIn.current = (viewport.width / 2 + 1.5 * rigScale) / (rigScale * Math.cos(TURN_START))

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

// "Studijska" svetla za odsjaje na farbi: nekoliko svetlih ploča oko trokolice, snimljenih jednom u
// okruženje scene. Isto što i Environment + Lightformer iz drei, ali bez te biblioteke (3D deo je
// tako nekoliko stotina KB manji i trokolica se brže pojavi).
const LIGHTFORMERS = [
  // [jačina, položaj, veličina, rotacija (bez nje ploča gleda ka sredini), boja]
  [3, [0, 6, 0], [10, 4, 1], [Math.PI / 2, 0, 0]],
  [2, [0, 2, 6], [10, 0.6, 1]],
  [1.5, [0, 0.6, 6], [10, 0.3, 1]],
  [1.2, [-6, 2, 0], [6, 2, 1], [0, Math.PI / 2, 0]],
  [1, [6, 1, -2], [6, 2, 1], [0, -Math.PI / 2, 0], '#ffcfc4'],
]

function StudioEnvironment() {
  const { gl, scene, invalidate } = useThree()
  useEffect(() => {
    const room = new THREE.Scene()
    const plane = new THREE.PlaneGeometry(1, 1)
    const materials = LIGHTFORMERS.map(([intensity, position, size, rotation, color = 'white']) => {
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false })
      const mesh = new THREE.Mesh(plane, material)
      mesh.position.set(...position)
      mesh.scale.set(...size)
      if (rotation) mesh.rotation.set(...rotation)
      else mesh.lookAt(0, 0, 0)
      room.add(mesh)
      return material
    })
    const target = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
    new THREE.CubeCamera(1, 1000, target).update(gl, room)
    scene.environment = target.texture
    invalidate()
    return () => {
      scene.environment = null
      target.dispose()
      plane.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [gl, scene, invalidate])
  return null
}

export default function HeroScene({ progress, active = true, compact = false, size = 1, lower = 0, onArrive }) {
  return (
    <Canvas frameloop={active ? 'demand' : 'never'} dpr={[1, 1.5]} camera={{ position: [0, 1.3, 8], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#ffd5c8" />
      <Scene progress={progress} compact={compact} trikeSize={size} lower={lower} onArrive={onArrive} />
      {/* "studijska" svetla za odsjaje na farbi, bez preuzimanja HDR fajlova */}
      <StudioEnvironment />
    </Canvas>
  )
}
