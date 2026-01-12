import { Component } from 'react';
import { Navigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const searchParams = new URLSearchParams({
        code: '500',
        message: this.state.error.message,
        stack: this.state.error.stack || 'No stack trace available'
      });

      return <Navigate to={`/error?${searchParams.toString()}`} replace />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;