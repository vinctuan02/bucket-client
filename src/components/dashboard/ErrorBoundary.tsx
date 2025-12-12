'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorState from './ErrorState';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error(
			'Dashboard Error Boundary caught an error:',
			error,
			errorInfo,
		);

		// Log error to monitoring service in production
		if (process.env.NODE_ENV === 'production') {
			// Example: logErrorToService(error, errorInfo);
		}
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	handleGoHome = () => {
		window.location.href = '/';
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<ErrorState
					error={
						this.state.error?.message ||
						'An unexpected error occurred'
					}
					onRetry={this.handleRetry}
					onGoHome={this.handleGoHome}
				/>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
