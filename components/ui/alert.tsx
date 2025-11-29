import React from 'react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  className?: string
}

export function Alert({ children, variant = 'default', className = '' }: AlertProps) {
  const baseStyles = 'relative rounded-lg border p-4'
  
  const variantStyles = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
  }
  
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function AlertDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  )
}

