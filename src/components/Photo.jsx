import logo from '../assets/logo.png'

// Sve slike iz src/assets/photos, po imenu fajla bez ekstenzije (hero.jpg -> "hero").
const PHOTOS = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/photos/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' })).map(
    ([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url],
  ),
)

export default function Photo({ name, alt, label, className = '', priority = false, zoom = false }) {
  const src = PHOTOS[name]
  const zoomClass = zoom ? 'transition-transform duration-700 ease-out group-hover:scale-105' : ''
  return (
    <div className={`relative overflow-hidden bg-[#dfe5ef] ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${zoomClass}`}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={`absolute inset-0 flex items-end bg-gradient-to-br from-[#e8edf5] to-[#c9d3e3] p-4 ${zoomClass}`}
        >
          {/* dok nema prave fotografije: logo u sredini */}
          <img src={logo} alt="" className="absolute left-1/2 top-1/2 w-[22%] min-w-14 max-w-28 -translate-x-1/2 -translate-y-1/2 opacity-30 grayscale" />
          {/* oznaka se vidi samo tokom razvoja, ne na objavljenom sajtu */}
          {import.meta.env.DEV && <span className="text-sm text-deep/60">Ovde ide fotografija: {label}</span>}
        </div>
      )}
    </div>
  )
}
