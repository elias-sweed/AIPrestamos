import * as React from 'react'

export interface EmptyViewProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const EmptyView = ({ icon, title, subtitle, action }: EmptyViewProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-[#E0E0E0] flex items-center justify-center mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-[#212121]">{title}</h3>
    {subtitle && <p className="text-[#616161] mt-1">{subtitle}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
)
