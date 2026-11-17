import * as React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padding = 'md', children, ...props }, ref) => {
    const p: Record<string, string> = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }
    return (
      <div
        ref={ref}
        className={`rounded card bg-white border border-[#E0E0E0] shadow-card ${p[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
