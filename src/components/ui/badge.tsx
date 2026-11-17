import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'neon-badge neon-badge-default',
      success: 'neon-badge neon-badge-success',
      warning: 'neon-badge neon-badge-warning',
      error: 'neon-badge neon-badge-error',
      primary: 'neon-badge neon-badge-primary',
    }
    return (
      <span
        ref={ref}
        className={`${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  },
)

Badge.displayName = 'Badge'
