import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useCanvasTexture, drawLogo, drawPhone, drawBird, drawBeep, drawWeave, drawTread, drawPlate } from './textures'

// Električna trokolica Beep Beep dostave (Ligier Pulse 3), napravljena kodom po fotografijama.
// Mere su u metrima, prednji točak gleda ka +x, tlo je na y = 0.

const VEHICLE_PHONE = '064 44 77 2 77' // broj kako piše na kutiji trokolice

export const REAR_R = 0.28
export const FRONT_R = 0.26
const REAR_X = -0.5
const REAR_Z = 0.42
const FRONT_X = 0.98

// kutija za dostavu: zadnja strana ima oblik kućice, krov se pruža od napred ka nazad
export const BOX = { x: -0.52, y: 0.76, len: 0.84, wall: 0.62, peak: 0.8, width: 0.78 }

function houseShape(half, bottom, wall, peak) {
  const s = new THREE.Shape()
  s.moveTo(-half, bottom)
  s.lineTo(half, bottom)
  s.lineTo(half, wall)
  s.lineTo(0, peak)
  s.lineTo(-half, wall)
  s.lineTo(-half, bottom)
  return s
}

function polyShape(points) {
  const s = new THREE.Shape()
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  return s
}

/** UV koordinate po zadatim granicama, da više delova deli istu teksturu (vrata + trougao kućice). */
function planarUV(geometry, minX, maxX, minY, maxY) {
  const pos = geometry.attributes.position
  const uv = []
  for (let i = 0; i < pos.count; i++) uv.push((pos.getX(i) - minX) / (maxX - minX), (pos.getY(i) - minY) / (maxY - minY))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  return geometry
}

/** Oblik izvučen u dubinu (po z), centriran; `alongX` ga okreće da se pruža po dužini vozila. */
function extrude(shape, depth, bevel, alongX = false, segments = 3) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: 32,
  })
  g.translate(0, 0, -depth / 2)
  if (alongX) g.rotateY(Math.PI / 2)
  g.computeVertexNormals()
  return g
}

function useMaterials() {
  const weave = useCanvasTexture(128, 128, drawWeave, { color: false })
  const tread = useCanvasTexture(1024, 128, drawTread, { color: false })
  return useMemo(() => {
    weave.wrapS = weave.wrapT = THREE.RepeatWrapping
    weave.repeat.set(28, 28)
    const paint = { color: '#f2b215', roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05 }
    return {
      yellow: new THREE.MeshPhysicalMaterial(paint),
      yellowDouble: new THREE.MeshPhysicalMaterial({ ...paint, side: THREE.DoubleSide }),
      plastic: new THREE.MeshStandardMaterial({ color: '#17191c', roughness: 0.55 }),
      plasticDouble: new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.7, side: THREE.DoubleSide }),
      tube: new THREE.MeshPhysicalMaterial({ color: '#1b1c1f', roughness: 0.35, metalness: 0.4, clearcoat: 0.6 }),
      metal: new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.35, metalness: 0.7 }),
      checker: new THREE.MeshStandardMaterial({ color: '#8d9298', roughness: 0.3, metalness: 0.9 }),
      fabric: new THREE.MeshStandardMaterial({ color: '#23262c', roughness: 0.92, bumpMap: weave, bumpScale: 0.6 }),
      reflective: new THREE.MeshStandardMaterial({ color: '#a4a9b0', roughness: 0.28, metalness: 0.55 }),
      tire: new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.82, bumpMap: tread, bumpScale: 1.2 }),
      rim: new THREE.MeshPhysicalMaterial({ color: '#232427', roughness: 0.3, metalness: 0.75, clearcoat: 0.5 }),
      rimDark: new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.6, metalness: 0.4 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#d9dce0', roughness: 0.08, metalness: 1 }),
      redLens: new THREE.MeshPhysicalMaterial({ color: '#9c0d12', emissive: '#c4121a', emissiveIntensity: 0.35, roughness: 0.08, clearcoat: 1 }),
      clearLens: new THREE.MeshPhysicalMaterial({ color: '#eef2f5', emissive: '#fff6e4', emissiveIntensity: 0.25, roughness: 0.05, metalness: 0.2, clearcoat: 1 }),
      light: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4dc', emissiveIntensity: 1.2, roughness: 0.1 }),
      screen: new THREE.MeshStandardMaterial({ color: '#2b3a3f', roughness: 0.15, metalness: 0.3 }),
      hold: new THREE.MeshStandardMaterial({ color: '#08090a', roughness: 1 }),
    }
  }, [weave, tread])
}

/** Guma zaobljenog profila (okretanje preseka oko ose) + felna sa pet krakova. */
function Wheel({ position, radius, width, spinRef, m }) {
  const side = Math.sign(position[2]) || 1
  const tire = useMemo(() => {
    const r = radius
    const rin = r * 0.7
    const h = width / 2
    const pts = [
      [rin, -h + 0.012],
      [r - 0.05, -h],
      [r - 0.018, -h + 0.014],
      [r - 0.003, -h + 0.04],
      [r, -h + 0.06],
      [r, h - 0.06],
      [r - 0.003, h - 0.04],
      [r - 0.018, h - 0.014],
      [r - 0.05, h],
      [rin, h - 0.012],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 72)
  }, [radius, width])

  return (
    <group position={position}>
      <group ref={spinRef} userData={{ radius }}>
        <mesh geometry={tire} material={m.tire} rotation={[Math.PI / 2, 0, 0]} />
        {/* udubljenje felne i spoljni obod */}
        <mesh material={m.rimDark} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.7, radius * 0.7, width * 0.82, 48]} />
        </mesh>
        {[1, -1].map((face) => (
          <group key={face} position={[0, 0, face * side * width * 0.41]}>
            <mesh material={m.rim}>
              <torusGeometry args={[radius * 0.68, 0.014, 10, 64]} />
            </mesh>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 + Math.PI / 2
              return (
                <mesh key={i} material={m.rim} position={[Math.cos(a) * radius * 0.4, Math.sin(a) * radius * 0.4, 0]} rotation={[0, 0, a]}>
                  <boxGeometry args={[radius * 0.56, radius * 0.13, 0.03]} />
                </mesh>
              )
            })}
            <mesh material={m.rim} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[radius * 0.17, radius * 0.19, 0.04, 28]} />
            </mesh>
            <mesh material={m.chrome} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, face * side * 0.022]}>
              <cylinderGeometry args={[radius * 0.07, radius * 0.07, 0.01, 20]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** Debeli zaobljeni blatobran: luk koji obuhvata točak od napred, preko vrha, do pozadi. */
function Fender({ position, radius, thickness = 0.035, width, material, from = 0.15, to = 3.4 }) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape()
    s.absarc(0, 0, radius + thickness, from, to, false)
    s.absarc(0, 0, radius, to, from, true)
    s.closePath()
    return extrude(s, width, 0.012)
  }, [])
  return <mesh geometry={geometry} material={material} position={position} />
}

function Tube({ points, radius = 0.018, material }) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 64, radius, 12, false),
    [],
  )
  return <mesh geometry={geometry} material={material} />
}

function DeliveryBox({ parts, m }) {
  const { len, wall, peak, width } = BOX
  const half = len / 2
  const hw = width / 2

  const shell = useMemo(() => extrude(houseShape(hw - 0.015, 0, wall, peak), len - 0.03, 0.015, true), [])

  // krovna navlaka: preklapa se preko kutije i spušta niz bokove
  const roof = useMemo(() => {
    const R = hw + 0.03
    const slope = (peak - wall) / hw
    const lip = wall - 0.07
    return extrude(
      polyShape([
        [-R, lip],
        [-R, wall + 0.035 - 0.03 * slope],
        [0, peak + 0.04],
        [R, wall + 0.035 - 0.03 * slope],
        [R, lip],
        [hw + 0.002, lip],
        [hw + 0.002, wall],
        [0, peak],
        [-hw - 0.002, wall],
        [-hw - 0.002, lip],
      ]),
      len + 0.04,
      0.008,
      true,
      2,
    )
  }, [])

  // zadnja strana: nalepnica u obliku kućice; donji deo je na vratima, trougao ostaje na kutiji
  const panel = { half: hw - 0.06, bottom: 0.12, top: peak - 0.07, eave: wall - 0.012 }
  const doorDecal = useMemo(
    () =>
      planarUV(
        new THREE.ShapeGeometry(polyShape([[-panel.half, panel.bottom], [panel.half, panel.bottom], [panel.half, panel.eave], [-panel.half, panel.eave]])),
        -panel.half, panel.half, panel.bottom, panel.top,
      ),
    [],
  )
  const gableDecal = useMemo(
    () =>
      planarUV(
        new THREE.ShapeGeometry(polyShape([[-panel.half, panel.eave], [panel.half, panel.eave], [0, panel.top]])),
        -panel.half, panel.half, panel.bottom, panel.top,
      ),
    [],
  )
  const rearTexture = useCanvasTexture(900, 1024, (c, w, h) => {
    // kućica: bela podloga, gore ptica i "BEEP! BEEP!", u sredini logo, dole telefon
    const eaveY = h * (1 - (panel.eave - panel.bottom) / (panel.top - panel.bottom))
    c.fillStyle = '#f7f7f4'
    c.beginPath()
    c.moveTo(0, h)
    c.lineTo(w, h)
    c.lineTo(w, eaveY)
    c.lineTo(w / 2, 0)
    c.lineTo(0, eaveY)
    c.closePath()
    c.fill()
    drawBird(c, w * 0.36, h * 0.27, h * 0.115)
    drawBeep(c, w * 0.62, h * 0.29, h * 0.075)
    drawLogo(c, w / 2, h * 0.56, 150)
    drawPhone(c, w * 0.04, h * 0.79, w * 0.92, h * 0.14, VEHICLE_PHONE)
  })

  // bok: gore traka sa telefonom, dole bela nalepnica sa pticom i logom (ostalo je providno)
  const sideW = len - 0.08
  const sideH = wall - 0.07
  const sideTexture = useCanvasTexture(1024, 736, (c, w, h) => {
    c.clearRect(0, 0, w, h)
    c.fillStyle = '#f7f7f4'
    c.beginPath()
    c.roundRect(w * 0.02, h * 0.12, w * 0.84, h * 0.21, 10)
    c.fill()
    drawPhone(c, w * 0.04, h * 0.145, w * 0.8, h * 0.16, VEHICLE_PHONE)
    c.fillStyle = '#f7f7f4'
    c.beginPath()
    c.roundRect(w * 0.03, h * 0.44, w * 0.94, h * 0.45, 12)
    c.fill()
    drawBird(c, w * 0.15, h * 0.665, h * 0.17)
    drawLogo(c, w * 0.63, h * 0.65, 138)
  })

  return (
    <group position={[BOX.x, BOX.y, 0]}>
      <mesh geometry={shell} material={m.fabric} />
      <mesh geometry={roof} material={m.fabric} />
      {/* svetloodbojni kvadrati na uglovima krovne navlake */}
      {[1, -1].map((z) =>
        [1, -1].map((x) => (
          <mesh key={`${z}${x}`} material={m.reflective} position={[x * (half - 0.05), wall - 0.035, z * (hw + 0.032)]}>
            <boxGeometry args={[0.07, 0.045, 0.004]} />
          </mesh>
        )),
      )}
      {/* svetloodbojna traka oko dna */}
      <mesh material={m.reflective} position={[0, 0.07, 0]}>
        <boxGeometry args={[len + 0.006, 0.05, width + 0.006]} />
      </mesh>
      {/* bočne nalepnice */}
      {[1, -1].map((z) => (
        <mesh key={z} position={[0, 0.06 + sideH / 2, z * (hw + 0.004)]} rotation={[0, z > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[sideW, sideH]} />
          <meshPhysicalMaterial map={sideTexture} transparent alphaTest={0.5} roughness={0.35} clearcoat={0.6} />
        </mesh>
      ))}
      {/* trougao kućice ostaje na mestu */}
      <mesh geometry={gableDecal} position={[-half - 0.017, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <meshPhysicalMaterial map={rearTexture} roughness={0.35} clearcoat={0.6} />
      </mesh>
      {/* unutrašnjost koja se vidi kad se zadnja vrata podignu */}
      <mesh material={m.hold} position={[-half - 0.017, wall / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[width - 0.08, wall - 0.08]} />
      </mesh>
      {/* zadnja vrata kutije: šarka je gore, otvaraju se nagore */}
      <group ref={(el) => (parts.current.hatch = el)} position={[-half - 0.03, wall - 0.01, 0]}>
        <mesh material={m.fabric} position={[0, -(wall - 0.01) / 2, 0]}>
          <boxGeometry args={[0.022, wall - 0.01, width + 0.01]} />
        </mesh>
        <mesh geometry={doorDecal} position={[-0.012, -(wall - 0.01), 0]} rotation={[0, -Math.PI / 2, 0]}>
          <meshPhysicalMaterial map={rearTexture} roughness={0.35} clearcoat={0.6} />
        </mesh>
        <mesh material={m.reflective} position={[-0.013, -(wall - 0.01) + 0.07, 0]}>
          <boxGeometry args={[0.006, 0.05, width + 0.01]} />
        </mesh>
        {/* bravica */}
        <mesh material={m.plastic} position={[-0.02, -(wall - 0.01) + 0.035, 0]}>
          <boxGeometry args={[0.02, 0.06, 0.08]} />
        </mesh>
      </group>
    </group>
  )
}

/** Zadnji žuti deo karoserije: bočni profil izvučen u širinu, sa zaobljenim ivicama. */
function RearBody({ m }) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.94, 0.24)
    s.lineTo(-0.06, 0.24)
    s.quadraticCurveTo(0.02, 0.24, 0.0, 0.34)
    s.lineTo(-0.04, 0.58)
    s.quadraticCurveTo(-0.06, 0.66, -0.14, 0.66)
    s.lineTo(-0.9, 0.66)
    s.quadraticCurveTo(-1.0, 0.66, -1.0, 0.58)
    s.lineTo(-1.0, 0.32)
    s.quadraticCurveTo(-1.0, 0.24, -0.94, 0.24)
    return extrude(s, 0.54, 0.045, false, 6)
  }, [])
  return <mesh geometry={geometry} material={m.yellow} />
}

/** parts.current dobija: wheels (niz), hatch */
export default function Trike({ parts }) {
  const m = useMaterials()
  const setWheel = (i) => (el) => ((parts.current.wheels ||= [])[i] = el)
  const plate = useCanvasTexture(280, 440, (c, w, h) => drawPlate(c, w, h, 'NG', '27·277'))

  return (
    <group>
      <RearBody m={m} />
      {/* blatobrani zadnjih točkova sa crnom unutrašnjom oblogom */}
      {[REAR_Z, -REAR_Z].map((z) => (
        <group key={z}>
          <Fender position={[REAR_X, REAR_R, z]} radius={0.315} width={0.2} material={m.yellowDouble} from={0.2} to={3.35} />
          <mesh material={m.plasticDouble} position={[REAR_X, REAR_R, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.312, 0.312, 0.2, 40, 1, true, -0.2 + Math.PI / 2, 3.1]} />
          </mesh>
        </group>
      ))}

      {/* zadnja strana: tablica, svetla, katadiopteri i branik */}
      <mesh material={m.plastic} position={[-1.05, 0.43, 0]}>
        <boxGeometry args={[0.016, 0.25, 0.165]} />
      </mesh>
      <mesh position={[-1.059, 0.43, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.14, 0.22]} />
        <meshStandardMaterial map={plate} roughness={0.4} metalness={0.2} />
      </mesh>
      <RoundedBox material={m.clearLens} args={[0.03, 0.05, 0.17]} radius={0.012} position={[-1.035, 0.64, 0]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={m.redLens} position={[-1.04, 0.31, s * 0.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.016, 28]} />
          </mesh>
          <mesh material={m.redLens} position={[-1.035, 0.57, s * 0.24]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.016, 24]} />
          </mesh>
          {/* migavci na krajevima cevi */}
          <mesh material={m.clearLens} position={[-0.99, 0.52, s * 0.35]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1.6, 1]}>
            <sphereGeometry args={[0.028, 20, 14]} />
          </mesh>
        </group>
      ))}
      <RoundedBox material={m.plastic} args={[0.07, 0.07, 0.68]} radius={0.03} position={[-1.04, 0.2, 0]} />
      <RoundedBox material={m.plastic} args={[0.9, 0.05, 0.6]} radius={0.02} position={[-0.52, 0.19, 0]} />

      {/* nosač kutije i zaštitne cevi oko nje */}
      <mesh material={m.plastic} position={[BOX.x, BOX.y - 0.025, 0]}>
        <boxGeometry args={[BOX.len + 0.06, 0.05, BOX.width + 0.04]} />
      </mesh>
      {[1, -1].map((s) => (
        <Tube
          key={s}
          material={m.tube}
          points={[
            [-0.99, 0.52, s * 0.33],
            [-1.0, 0.66, s * 0.42],
            [-0.86, 0.75, s * 0.455],
            [-0.24, 0.75, s * 0.455],
            [-0.04, 0.62, s * 0.4],
            [0.1, 0.42, s * 0.26],
          ]}
        />
      ))}

      <DeliveryBox parts={parts} m={m} />

      {/* sedište i šasija */}
      <RoundedBox material={m.plastic} args={[0.42, 0.1, 0.34]} radius={0.045} smoothness={5} position={[0.12, 0.86, 0]} />
      <RoundedBox material={m.plastic} args={[0.3, 0.36, 0.3]} radius={0.05} position={[0.1, 0.63, 0]} />
      <RoundedBox material={m.plastic} args={[0.6, 0.1, 0.3]} radius={0.04} position={[0.22, 0.36, 0]} />
      {/* pod za noge sa rebrastim limom */}
      <RoundedBox material={m.plastic} args={[0.42, 0.06, 0.38]} radius={0.025} position={[0.5, 0.34, 0]} />
      <mesh material={m.checker} position={[0.5, 0.372, 0]}>
        <boxGeometry args={[0.38, 0.004, 0.34]} />
      </mesh>
      {[-0.14, -0.1, -0.06, -0.02, 0.02, 0.06, 0.1, 0.14].map((z) => (
        <mesh key={z} material={m.checker} position={[0.5, 0.377, z]}>
          <boxGeometry args={[0.36, 0.006, 0.012]} />
        </mesh>
      ))}

      {/* prednji deo: crni štitnik za noge i žuta maska */}
      <RoundedBox material={m.plastic} args={[0.08, 0.78, 0.42]} radius={0.035} position={[0.74, 0.74, 0]} rotation={[0, 0, 0.22]} />
      <RoundedBox material={m.yellow} args={[0.13, 0.82, 0.48]} radius={0.06} smoothness={5} position={[0.82, 0.74, 0]} rotation={[0, 0, 0.22]} />
      <Fender position={[FRONT_X, FRONT_R, 0]} radius={0.29} thickness={0.025} width={0.14} material={m.plastic} from={0.1} to={2.6} />
      {/* viljuška */}
      {[0.08, -0.08].map((z) => (
        <mesh key={z} material={m.metal} position={[0.92, 0.5, z]} rotation={[0, 0, 0.24]}>
          <cylinderGeometry args={[0.022, 0.022, 0.55, 12]} />
        </mesh>
      ))}
      {/* prednji prtljažnik od cevi */}
      <group position={[0.98, 1.0, 0]}>
        {[0.17, -0.17].map((z) => (
          <mesh key={z} material={m.tube} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 10]} />
          </mesh>
        ))}
        {[-0.14, 0, 0.14].map((x) => (
          <mesh key={x} material={m.tube} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.011, 0.011, 0.35, 10]} />
          </mesh>
        ))}
        {[0.15, -0.15].map((z) => (
          <mesh key={z} material={m.tube} position={[-0.12, -0.08, z]} rotation={[0, 0, -0.7]}>
            <cylinderGeometry args={[0.011, 0.011, 0.2, 10]} />
          </mesh>
        ))}
      </group>

      {/* volan, kontrolna tabla, far i retrovizori */}
      <mesh material={m.metal} position={[0.76, 1.16, 0]} rotation={[0, 0, 0.24]}>
        <cylinderGeometry args={[0.03, 0.03, 0.22, 12]} />
      </mesh>
      <mesh material={m.metal} position={[0.72, 1.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.017, 0.017, 0.66, 12]} />
      </mesh>
      {[0.3, -0.3].map((z) => (
        <mesh key={z} material={m.plastic} position={[0.72, 1.24, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.026, 0.026, 0.13, 16]} />
        </mesh>
      ))}
      <RoundedBox material={m.yellow} args={[0.17, 0.15, 0.24]} radius={0.03} position={[0.78, 1.25, 0]} rotation={[0, 0, 0.3]} />
      <mesh material={m.screen} position={[0.72, 1.31, 0]} rotation={[0, 0, 0.3 + Math.PI / 2]}>
        <planeGeometry args={[0.1, 0.16]} />
      </mesh>
      <mesh material={m.light} position={[0.87, 1.2, 0]} rotation={[0, 0, Math.PI / 2 + 0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={m.metal} position={[0.72, 1.34, s * 0.31]} rotation={[s * 0.35, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.22, 8]} />
          </mesh>
          <mesh material={m.plastic} position={[0.72, 1.46, s * 0.36]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.75]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 32]} />
          </mesh>
          <mesh material={m.chrome} position={[0.708, 1.46, s * 0.36]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.72]}>
            <cylinderGeometry args={[0.066, 0.066, 0.005, 32]} />
          </mesh>
        </group>
      ))}

      {/* točkovi */}
      <Wheel position={[REAR_X, REAR_R, REAR_Z]} radius={REAR_R} width={0.17} spinRef={setWheel(0)} m={m} />
      <Wheel position={[REAR_X, REAR_R, -REAR_Z]} radius={REAR_R} width={0.17} spinRef={setWheel(1)} m={m} />
      <Wheel position={[FRONT_X, FRONT_R, 0]} radius={FRONT_R} width={0.12} spinRef={setWheel(2)} m={m} />
    </group>
  )
}
