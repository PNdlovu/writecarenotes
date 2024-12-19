import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { BedError } from '../types/errors'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class BedErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BedErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const error = this.state.error
      const isBedError = error instanceof BedError

      return (
        <Alert variant="destructive">
          <AlertTitle>
            {isBedError ? 'Bed Management Error' : 'Something went wrong'}
          </AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error?.message || 'An unexpected error occurred'}</p>
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}


