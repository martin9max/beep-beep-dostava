const VARIANTS = { primary: 'btn-primary', ghost: 'btn-ghost', light: 'btn-light' }

export default function Button({ as: Tag = 'button', variant = 'primary', arrow = false, className = '', children, ...rest }) {
  const defaultType = Tag === 'button' && !rest.type ? { type: 'button' } : {}
  return (
    <Tag className={`btn ${VARIANTS[variant]} ${className}`} {...defaultType} {...rest}>
      {children}
      {arrow && (
        <svg className="arrow h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 8h11M9 4l4 4-4 4" />
        </svg>
      )}
    </Tag>
  )
}
