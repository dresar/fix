import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Auto-reload on chunk load error
    if (error.message.includes('Failed to fetch dynamically imported module') || 
        error.message.includes('Importing a module script failed')) {
      const storageKey = 'chunk_reload_time';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0');
      const now = Date.now();
      
      // If less than 10 seconds since last reload, stop loop and show UI
      if (now - lastReload > 10000) {
        sessionStorage.setItem(storageKey, String(now));
        
        // Force reload with cache busting query param
        const url = new URL(window.location.href);
        url.searchParams.set('t', String(now));
        window.location.href = url.toString();
        return;
      }
    }

    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-12 w-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Our team has been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 rounded-lg bg-muted text-left overflow-auto max-h-[300px] text-xs font-mono border border-border">
                <p className="font-bold text-destructive mb-2 break-words">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <div className="mb-4 whitespace-pre-wrap text-muted-foreground break-all">
                    {this.state.error.stack}
                  </div>
                )}
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium mb-1">Component Stack</summary>
                    <pre className="whitespace-pre-wrap text-muted-foreground">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
              <Button onClick={this.handleReload}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
