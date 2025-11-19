import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Application error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false }, () => {
      window.location.reload();
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Application error</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="mt-4 max-w-sm text-sm text-slate-500">
            An unexpected error occurred. Please refresh the page or try again later.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-8 inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

