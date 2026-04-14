import type { ReactNode } from 'react'

type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'pink'

interface BadgeProps {
  children: ReactNode
  color?: BadgeColor
  className?: string
}

const colors: Record<BadgeColor, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-slate-100 text-slate-600',
  pink: 'bg-pink-100 text-pink-700',
}

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
