import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', loading = false, fullWidth = false, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded border font-medium transition-all disabled:opacity-60 disabled:pointer-events-none'
    const variants: Record<string, string> = {
      primary: `bg-gradient-to-r from-[#1565C0] to-[#00F2FF] text-white border border-transparent shadow-[0_0_30px_rgba(21,101,192,0.4)]`,
      success: `bg-[#2E7D32] text-white border border-[#4CAF50]/30 shadow-[0_0_20px_rgba(46,125,50,0.4)]`,
      warning: `bg-[#E65100] text-white border border-[#FF9800]/30 shadow-[0_0_20px_rgba(230,81,0,0.4)]`,
      error: `bg-[#C62828] text-white border border-[#F44336]/30 shadow-[0_0_20px_rgba(198,40,40,0.4)]`,
      outline: `border border-white/30 text-white bg-black/40`,
      ghost: `text-[#90CAF9] bg-transparent hover:bg-white/10`,
    }
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
