// Iseca logo u krug i pravi favicon, ikonice za telefon i sliku za deljenje linka.
// Radi samo na Mac-u, bez instalacije paketa:  swift scripts/brand.swift
import AppKit
import ImageIO
import UniformTypeIdentifiers

let source = "branding/logo-source.png"
let navy = NSColor(srgbRed: 0x0f / 255, green: 0x27 / 255, blue: 0x66 / 255, alpha: 1)
let red = NSColor(srgbRed: 0xd7 / 255, green: 0x1e / 255, blue: 0x28 / 255, alpha: 1)

func fail(_ msg: String) -> Never { FileHandle.standardError.write((msg + "\n").data(using: .utf8)!); exit(1) }

guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: source) as CFURL, nil),
      let logo = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fail("Ne mogu da učitam \(source)") }
let W = logo.width, H = logo.height
let space = CGColorSpace(name: CGColorSpace.sRGB)!

func context(_ w: Int, _ h: Int) -> CGContext {
  let c = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0, space: space,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  c.interpolationQuality = .high
  return c
}

// 1) pronađi krug: pikseli koji se jasno razlikuju od tamne pozadine u uglu
let scan = context(W, H)
scan.draw(logo, in: CGRect(x: 0, y: 0, width: W, height: H))
let px = scan.data!.bindMemory(to: UInt8.self, capacity: scan.bytesPerRow * H)
func pixel(_ x: Int, _ y: Int) -> (Int, Int, Int) {
  let i = y * scan.bytesPerRow + x * 4
  return (Int(px[i]), Int(px[i + 1]), Int(px[i + 2]))
}
let bg = pixel(2, 2)
var minX = W, minY = H, maxX = 0, maxY = 0
for y in 0..<H {
  for x in 0..<W {
    let p = pixel(x, y)
    if abs(p.0 - bg.0) + abs(p.1 - bg.1) + abs(p.2 - bg.2) > 60 {
      minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
    }
  }
}
let d = Double(min(maxX - minX, maxY - minY) + 1) - 4 // mali rez unutra, bez tamne ivice
// redovi u memoriji idu odozgo nadole, a crtanje odozdo nagore, pa y okrećemo
let cx = Double(minX + maxX) / 2 + 0.5
let cy = Double(H) - Double(minY + maxY) / 2 - 0.5
print("krug: centar \(cx),\(cy) prečnik \(d)")

/** Logo isečen u krug, providna pozadina. */
func round(_ size: Int) -> CGImage {
  let c = context(size, size)
  let s = Double(size) / d
  c.addEllipse(in: CGRect(x: 0, y: 0, width: size, height: size))
  c.clip()
  c.draw(logo, in: CGRect(x: -(cx - d / 2) * s, y: -(cy - d / 2) * s, width: Double(W) * s, height: Double(H) * s))
  return c.makeImage()!
}

/** Krug na plavoj podlozi (iOS i Android same zaobljuju uglove ikonice). */
func onNavy(_ size: Int, _ scale: Double) -> CGImage {
  let c = context(size, size)
  c.setFillColor(navy.cgColor)
  c.fill(CGRect(x: 0, y: 0, width: size, height: size))
  let inner = Double(size) * scale
  let o = (Double(size) - inner) / 2
  c.draw(round(Int(inner)), in: CGRect(x: o, y: o, width: inner, height: inner))
  return c.makeImage()!
}

func pngData(_ image: CGImage) -> Data {
  let data = NSMutableData()
  let dest = CGImageDestinationCreateWithData(data, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, image, nil)
  CGImageDestinationFinalize(dest)
  return data as Data
}
func save(_ image: CGImage, _ path: String) {
  try! pngData(image).write(to: URL(fileURLWithPath: path))
  print("  \(path)")
}

/** .ico sa PNG slikama unutra. */
func ico(_ sizes: [Int], _ path: String) {
  let pngs = sizes.map { pngData(round($0)) }
  var out = Data()
  func u16(_ v: Int) { out.append(contentsOf: [UInt8(v & 0xff), UInt8(v >> 8 & 0xff)]) }
  func u32(_ v: Int) { u16(v & 0xffff); u16(v >> 16 & 0xffff) }
  u16(0); u16(1); u16(pngs.count)
  var offset = 6 + 16 * pngs.count
  for (i, png) in pngs.enumerated() {
    out.append(contentsOf: [UInt8(sizes[i] % 256), UInt8(sizes[i] % 256), 0, 0])
    u16(1); u16(32); u32(png.count); u32(offset)
    offset += png.count
  }
  pngs.forEach { out.append($0) }
  try! out.write(to: URL(fileURLWithPath: path))
  print("  \(path)")
}

try? FileManager.default.createDirectory(atPath: "public", withIntermediateDirectories: true)
print("ikonice:")
save(round(112), "src/assets/logo.png") // 2x za prikaz na 44-56 px
for s in [16, 32, 48, 96] { save(round(s), "public/favicon-\(s).png") }
ico([16, 32, 48], "public/favicon.ico")
save(onNavy(180, 0.86), "public/apple-touch-icon.png")
save(round(192), "public/icon-192.png")
save(round(512), "public/icon-512.png")
save(onNavy(512, 0.78), "public/icon-maskable-512.png")

// 2) slika za deljenje linka, 1200x630
let OW = 1200, OH = 630
let og = context(OW, OH)
let g = NSGraphicsContext(cgContext: og, flipped: true)
NSGraphicsContext.current = g
og.translateBy(x: 0, y: CGFloat(OH)); og.scaleBy(x: 1, y: -1) // koordinate odozgo nadole

let grad = CGGradient(colorsSpace: space, colors: [
  NSColor(srgbRed: 0x1d / 255, green: 0x3d / 255, blue: 0x96 / 255, alpha: 1).cgColor, navy.cgColor,
] as CFArray, locations: [0, 1])!
og.setFillColor(navy.cgColor); og.fill(CGRect(x: 0, y: 0, width: OW, height: OH))
og.drawRadialGradient(grad, startCenter: CGPoint(x: 940, y: 340), startRadius: 0, endCenter: CGPoint(x: 940, y: 340), endRadius: 720, options: [])
og.setFillColor(NSColor.white.cgColor); og.fill(CGRect(x: 0, y: OH - 28, width: OW, height: 6))
og.setFillColor(red.cgColor); og.fill(CGRect(x: 0, y: OH - 22, width: OW, height: 22))

// logo u belom krugu
og.setFillColor(NSColor.white.cgColor)
og.fillEllipse(in: CGRect(x: 80, y: 125, width: 360, height: 360))
og.saveGState()
og.translateBy(x: 90, y: 135 + 340); og.scaleBy(x: 1, y: -1)
og.draw(round(680), in: CGRect(x: 0, y: 0, width: 340, height: 340))
og.restoreGState()

func text(_ s: String, _ size: CGFloat, _ weight: NSFont.Weight, _ color: NSColor, _ x: CGFloat, _ y: CGFloat, width: CGFloat = 640, kern: CGFloat = 0) {
  let attrs: [NSAttributedString.Key: Any] = [.font: NSFont.systemFont(ofSize: size, weight: weight), .foregroundColor: color, .kern: kern]
  NSAttributedString(string: s, attributes: attrs).draw(with: CGRect(x: x, y: y, width: width, height: 400), options: [.usesLineFragmentOrigin])
}
let X: CGFloat = 500
// crvena pilula
let pill = NSAttributedString(string: "NEGOTIN I OKOLNA SELA", attributes: [.font: NSFont.systemFont(ofSize: 22, weight: .heavy), .kern: 2.0])
let pw = pill.size().width + 44
og.setFillColor(red.cgColor)
og.addPath(CGPath(roundedRect: CGRect(x: X, y: 112, width: pw, height: 42), cornerWidth: 21, cornerHeight: 21, transform: nil)); og.fillPath()
text("NEGOTIN I OKOLNA SELA", 22, .heavy, .white, X + 22, 120, kern: 2)
text("BEEP BEEP", 88, .black, .white, X - 4, 168, kern: -1.5)
text("DOSTAVA", 88, .black, red, X - 4, 258, kern: -1.5)
text("Dostava svega što vam je potrebno,\ndo vaših vrata.", 32, .semibold, NSColor.white.withAlphaComponent(0.85), X, 372, width: 620)
text("064 44 77 2 77", 58, .black, .white, X, 452, kern: 1)
NSGraphicsContext.current = nil
save(og.makeImage()!, "public/og-image.png")

// 3) manifest
let manifest = """
{
  "name": "Beep Beep Dostava Negotin",
  "short_name": "Beep Beep",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f2766",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}

"""
try! manifest.write(toFile: "public/site.webmanifest", atomically: true, encoding: .utf8)
print("  public/site.webmanifest\ngotovo")
