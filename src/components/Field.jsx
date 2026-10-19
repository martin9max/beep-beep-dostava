/** Polje forme sa natpisom; `as="textarea"` za duži tekst. */
export default function Field({ label, hint, as: Tag = 'input', className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-deep">{label}</span>
      <Tag
        className="block w-full rounded-lg border border-line bg-white px-3.5 py-3 text-[16px] text-deep outline-none transition placeholder:text-mute/60 focus:border-ink focus:ring-4 focus:ring-ink/15"
        rows={Tag === 'textarea' ? 3 : undefined}
        {...rest}
      />
      {hint && <span className="mt-1 block text-[13px] text-mute">{hint}</span>}
    </label>
  )
}

/** Crvena poruka o grešci iznad dugmeta. */
export function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-lg border border-red/30 bg-red/5 px-3.5 py-2.5 text-sm font-semibold text-red">
      {children}
    </p>
  )
}
