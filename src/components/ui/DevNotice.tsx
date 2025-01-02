import { AlertTriangle } from 'lucide-react'

export function DevNotice() {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Development Mode: Email verification is disabled and all accounts are created as admin.
          </p>
        </div>
      </div>
    </div>
  )
} 