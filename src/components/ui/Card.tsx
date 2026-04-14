import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
  padding?: boolean
}

export function Card({ children, className = '', header, footer, padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 font-medium text-slate-800">
          {header}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-500">
          {footer}
        </div>
      )}
    </div>
  )
}
