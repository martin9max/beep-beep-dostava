import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

// logo (ptica trkačica) koji se crta na nalepnicama; isti fajl koristi i telefon u Kontaktu
let logoImage
export function getLogo() {
  if (!logoImage) {
    logoImage = new Image()
    logoImage.src = `${import.meta.env.BASE_URL}icon-192.png`
  }
  return logoImage
}

/** Tekstura nacrtana na canvasu, tek kad se učitaju fontovi sa sajta i logo. */
export function useCanvasTexture(width, height, draw, { color = true } = {}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const t = new THREE.CanvasTexture(canvas)
    if (color) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [width, height])

  useEffect(() => {
    let alive = true
    Promise.all([document.fonts.ready, getLogo().decode().catch(() => {})]).then(() => {
      if (!alive) return
      const ctx = texture.image.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      draw(ctx, width, height)
      texture.needsUpdate = true
    })
    return () => {
      alive = false
    }
  }, [texture])

  return texture
}

export const SERIF = '"Source Serif 4 Variable", Georgia, serif'
export const SANS = '"Figtree Variable", sans-serif'
export const RED = '#d71e28'
export const BLUE = '#1e8fe6'
export const INK = '#1673c4'

/** Natpis "BeepBeep dostava" kao na trokolici: plavo + crveno, sa linijama brzine. */
export function drawLogo(c, cx, cy, size) {
  c.save()
  c.textBaseline = 'alphabetic'
  c.textAlign = 'left'
  c.font = `italic 900 ${size}px ${SANS}`
  const word = c.measureText('Beep').width
  const gap = -size * 0.04
  const total = word * 2 + gap
  const x0 = cx - total / 2
  c.fillStyle = BLUE
  c.fillText('Beep', x0, cy)
  c.fillStyle = RED
  c.fillText('Beep', x0 + word + gap, cy)
  // linije brzine
  const line = (color, x, y, w, h) => {
    c.fillStyle = color
    c.beginPath()
    c.roundRect(x, y, w, h, h / 2)
    c.fill()
  }
  line(BLUE, x0 + size * 0.15, cy + size * 0.12, total * 0.86, size * 0.07)
  line(RED, x0 + total * 0.42, cy + size * 0.25, total * 0.58, size * 0.06)
  line(RED, x0 + total * 0.56, cy + size * 0.36, total * 0.44, size * 0.05)
  c.fillStyle = BLUE
  c.textAlign = 'center'
  c.font = `800 ${size * 0.66}px ${SANS}`
  c.fillText('dostava', cx + total * 0.04, cy + size * 0.98)
  c.restore()
}

/** Crvena traka sa brojem telefona, kao na kutiji trokolice. */
export function drawPhone(c, x, y, w, h, phone) {
  c.save()
  c.fillStyle = RED
  c.beginPath()
  c.roundRect(x, y, w, h, h * 0.12)
  c.fill()
  c.font = `900 ${h * 0.66}px ${SANS}`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = '#111'
  c.fillText(phone, x + w / 2 + h * 0.04, y + h / 2 + h * 0.05)
  c.fillStyle = '#fff'
  c.fillText(phone, x + w / 2, y + h / 2)
  c.restore()
}

/** Okrugli logo sa pticom, sa belom ivicom. */
export function drawBird(c, cx, cy, r) {
  const img = getLogo()
  c.save()
  c.fillStyle = '#fff'
  c.beginPath()
  c.arc(cx, cy, r * 1.06, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.arc(cx, cy, r, 0, Math.PI * 2)
  c.clip()
  if (img.complete && img.naturalWidth) c.drawImage(img, cx - r, cy - r, r * 2, r * 2)
  else {
    c.fillStyle = RED
    c.fill()
  }
  c.restore()
}

/** Strip-natpis "BEEP! BEEP!" crvenim slovima sa crnom senkom. */
export function drawBeep(c, x, y, size, rotate = -0.08) {
  c.save()
  c.translate(x, y)
  c.rotate(rotate)
  c.font = `900 ${size}px ${SANS}`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.lineJoin = 'round'
  for (const [line, dy] of [['BEEP!', -size * 0.5], ['BEEP!', size * 0.5]]) {
    c.lineWidth = size * 0.16
    c.strokeStyle = '#111'
    c.strokeText(line, size * 0.05, dy + size * 0.05)
    c.fillStyle = RED
    c.fillText(line, 0, dy)
  }
  c.restore()
}

/** Sitna šara tkanine (za bumpMap): gusto tkanje sa malo šuma. */
export function drawWeave(c, w, h) {
  const img = c.createImageData(w, h)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const weave = ((x >> 1) + (y >> 1)) % 2 ? 150 : 105
      const v = weave + (Math.random() - 0.5) * 40
      const i = (y * w + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
  c.putImageData(img, 0, 0)
}

/** Šara gazećeg sloja gume (za bumpMap): kosi kanali po sredini. */
export function drawTread(c, w, h) {
  c.fillStyle = '#fff'
  c.fillRect(0, 0, w, h)
  c.fillStyle = '#000'
  const n = 64
  for (let i = 0; i < n; i++) {
    const x = (i / n) * w
    c.save()
    c.translate(x, h / 2)
    c.rotate(0.5 * (i % 2 ? 1 : -1))
    c.fillRect(-2, -h * 0.13, 5, h * 0.26)
    c.restore()
  }
  c.fillRect(0, h * 0.495, w, h * 0.01)
}

/** Registarska tablica u srpskom stilu za mopede (dva reda). */
export function drawPlate(c, w, h, top, bottom) {
  c.fillStyle = '#111'
  c.beginPath()
  c.roundRect(0, 0, w, h, w * 0.08)
  c.fill()
  c.fillStyle = '#f6f6f2'
  c.beginPath()
  c.roundRect(w * 0.06, w * 0.06, w * 0.88, h - w * 0.12, w * 0.05)
  c.fill()
  c.fillStyle = '#1e8fe6'
  c.fillRect(w * 0.06, w * 0.06, w * 0.12, h * 0.42)
  c.fillStyle = '#111'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  // uzana slova kao na pravim tablicama: tekst se sabija da stane u širinu
  const fit = (text, x, y, size, maxW) => {
    c.font = `700 ${size}px ${SANS}`
    const k = Math.min(1, maxW / c.measureText(text).width)
    c.save()
    c.translate(x, y)
    c.scale(k, 1)
    c.fillText(text, 0, 0)
    c.restore()
  }
  fit(top, w * 0.56, h * 0.3, h * 0.3, w * 0.66)
  fit(bottom, w * 0.5, h * 0.68, h * 0.3, w * 0.8)
  c.font = `700 ${h * 0.06}px ${SANS}`
  c.fillText('BEEP BEEP DOSTAVA', w * 0.5, h * 0.9)
}
