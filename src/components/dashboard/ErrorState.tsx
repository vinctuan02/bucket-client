'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React from 'react';

interface ErrorStateProps {
	error: string;
	onRetry?: () => void;
	onGoHome?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
	error,
	onRetry,
	onGoHome,
}) => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
			<div className="max-w-md w-full">
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
					{/* Error icon */}
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<AlertTriangle className="w-8 h-8 text-red-600" />
					</div>

					{/* Error message */}
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Dashboard Unavailable
					</h2>
					<p className="text-gray-600 mb-6">
						{error ||
							'Unable to load dashboard data. Please try again.'}
					</p>

					{/* Action buttons */}
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						{onRetry && (
							<button
								onClick={onRetry}
								className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
							>
								<RefreshCw className="w-4 h-4" />
								<span>Try Again</span>
							</button>
						)}

						{onGoHome && (
							<button
								onClick={onGoHome}
								className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
							>
								<Home className="w-4 h-4" />
								<span>Go Home</span>
							</button>
						)}
					</div>

					{/* Additional help */}
					<div className="mt-6 pt-6 border-t border-gray-200">
						<p className="text-sm text-gray-500">
							If the problem persists, please contact your system
							administrator.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ErrorState;
