import { RoundedBox } from '@react-three/drei'
import { useCanvasTexture, drawLogo, RED } from './textures'

export const PARCEL = [0.62, 0.46, 0.52]

/** Kartonski paket sa Beep Beep nalepnicom (nalepnica gleda ka -x). */
export default function Parcel() {
  const label = useCanvasTexture(800, 520, (c) => {
    c.fillStyle = '#fbfaf7'
    c.beginPath()
    c.roundRect(0, 0, 800, 520, 36)
    c.fill()
    drawLogo(c, 400, 250, 150)
  })
  const [w, h, d] = PARCEL
  return (
    <group>
      <RoundedBox args={PARCEL} radius={0.025} smoothness={4}>
        <meshStandardMaterial color="#c79a63" roughness={0.85} />
      </RoundedBox>
      {/* traka */}
      <mesh position={[0, h / 2 + 0.002, 0]}>
        <boxGeometry args={[w + 0.004, 0.004, 0.11]} />
        <meshStandardMaterial color={RED} roughness={0.4} />
      </mesh>
      <mesh position={[-w / 2 - 0.002, h / 2 - 0.08, 0]}>
        <boxGeometry args={[0.004, 0.16, 0.11]} />
        <meshStandardMaterial color={RED} roughness={0.4} />
      </mesh>
      <mesh position={[-w / 2 - 0.004, -0.04, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.36, 0.234]} />
        <meshStandardMaterial map={label} transparent roughness={0.5} />
      </mesh>
    </group>
  )
}
