export interface ErrorViewProps {
  onRetry?: () => void
  message?: string
}

export const ErrorView = ({ onRetry, message = 'No se pudieron cargar los datos.' }: ErrorViewProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <svg className="w-12 h-12 text-[#FF5252] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-[#E0E0E0]">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 text-[#00F2FF] font-medium hover:text-white">
        Reintentar
      </button>
    )}
  </div>
)
