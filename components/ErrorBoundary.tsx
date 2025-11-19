import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-screen bg-[#0A0A0A] text-white items-center justify-center p-6">
            <div className="max-w-lg w-full glass-panel p-8 rounded-xl border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <h1 className="font-title text-2xl text-red-400 mb-4 tracking-widest">CRITICAL SYSTEM FAILURE</h1>
                <p className="font-mono text-gray-300 mb-4">
                    An unexpected error caused the interface to crash.
                </p>
                {this.state.error && (
                    <div className="bg-black/50 p-4 rounded border border-red-900/50 mb-6 overflow-auto max-h-40">
                        <code className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                            {this.state.error.toString()}
                        </code>
                    </div>
                )}
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded hover:bg-red-500/30 transition-all font-bold tracking-wider"
                >
                    REBOOT SYSTEM
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;