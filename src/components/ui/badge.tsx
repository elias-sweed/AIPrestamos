import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-[#E0E0E0] text-[#616161]',
      success: 'bg-[#E8F5E9] text-[#2E7D32]',
      warning: 'bg-[#FFF3E0] text-[#E65100]',
      error: 'bg-[#FFEBEE] text-[#C62828]',
      primary: 'bg-[#E3F2FD] text-[#1565C0]',
    }
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  },
)

Badge.displayName = 'Badge'
