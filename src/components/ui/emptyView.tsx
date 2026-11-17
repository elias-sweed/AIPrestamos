import * as React from 'react'

export interface EmptyViewProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const EmptyView = ({ icon, title, subtitle, action }: EmptyViewProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">{icon}</div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    {subtitle && <p className="text-[#90CAF9] mt-1">{subtitle}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
)
