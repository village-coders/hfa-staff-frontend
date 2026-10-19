import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 m-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Something unexpected occurred</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              An error occurred while displaying this page. Your data is safe.
            </p>
            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-50 rounded-xl text-left border border-slate-200 overflow-x-auto text-[11px] font-mono text-rose-700">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw size={13} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoDashboard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Home size={13} />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
