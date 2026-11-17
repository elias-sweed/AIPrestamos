import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && <label className="block text-xs font-medium text-[#90CAF9] mb-1">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90CAF9]">{icon}</div>}
          <input
            ref={ref}
            className={`w-full rounded border px-4 py-3 focus:outline-none focus:ring-2 focus-ring-[#1565C0] focus:border-transparent transition-all bg-black/40 placeholder-white/40 ${
              error ? 'border-[#C62828]' : 'border-[#90CAF9]/50'
            } ${className} pl-10 pr-4`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#FFBABA]">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
