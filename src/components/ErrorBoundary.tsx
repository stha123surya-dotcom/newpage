import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="bg-red-50 text-red-900 p-6 rounded-2xl max-w-lg w-full border border-red-200">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4 text-red-800">
              An error occurred while communicating with the database or rendering the component.
            </p>
            <pre className="bg-white/50 p-4 rounded-xl overflow-auto text-sm">
              {this.state.error?.message}
            </pre>
            <button
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
