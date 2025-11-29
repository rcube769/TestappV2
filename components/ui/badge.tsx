import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors'
  
  const variantStyles = {
    default: 'bg-orange-100 text-orange-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 bg-transparent text-gray-700',
  }
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}

