'use client';

import { DashboardHeaderProps } from '@/types/dashboard.types';
import { Bell, Menu, Search, User } from 'lucide-react';
import React, { useState } from 'react';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	onSearch,
	notificationCount,
	userAvatar,
	userName,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(searchQuery);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
		// Debounced search could be implemented here
	};

	return (
		<header
			className="bg-white border-b border-gray-200 px-6 py-4"
			role="banner"
		>
			<div className="flex items-center justify-between">
				{/* Left section - Title and Search */}
				<div className="flex items-center space-x-6">
					{/* Dashboard title */}
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Admin Dashboard
						</h1>
						<p className="text-sm text-gray-600">
							Cloud Storage System Overview
						</p>
					</div>

					{/* Search bar */}
					<form
						onSubmit={handleSearchSubmit}
						className="hidden md:block"
					>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-4 w-4 text-gray-400" />
							</div>
							<input
								type="text"
								value={searchQuery}
								onChange={handleSearchChange}
								onFocus={() => setIsSearchFocused(true)}
								onBlur={() => setIsSearchFocused(false)}
								placeholder="Search dashboard..."
								className={`
                  block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-all duration-200 text-sm
                  ${isSearchFocused ? 'bg-white shadow-sm' : 'bg-gray-50'}
                `}
								aria-label="Search dashboard"
							/>
						</div>
					</form>
				</div>

				{/* Right section - Notifications and User */}
				<div className="flex items-center space-x-4">
					{/* Mobile search button */}
					<button
						type="button"
						className="md:hidden p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
						aria-label="Open search"
					>
						<Search className="h-5 w-5" />
					</button>

					{/* Notifications */}
					<div className="relative">
						<button
							type="button"
							className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
							aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
						>
							<Bell className="h-5 w-5" />
							{notificationCount > 0 && (
								<span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
									{notificationCount > 9
										? '9+'
										: notificationCount}
								</span>
							)}
						</button>
					</div>

					{/* User profile */}
					<div className="flex items-center space-x-3">
						<div className="hidden sm:block text-right">
							<div className="text-sm font-medium text-gray-900">
								{userName}
							</div>
							<div className="text-xs text-gray-500">
								Administrator
							</div>
						</div>

						<button
							type="button"
							className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
							aria-label="User menu"
						>
							{userAvatar ? (
								<img
									src={userAvatar}
									alt={`${userName} avatar`}
									className="h-8 w-8 rounded-full object-cover"
								/>
							) : (
								<div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
									<User className="h-4 w-4 text-white" />
								</div>
							)}
						</button>
					</div>

					{/* Mobile menu button */}
					<button
						type="button"
						className="md:hidden p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
						aria-label="Open menu"
					>
						<Menu className="h-5 w-5" />
					</button>
				</div>
			</div>

			{/* Mobile search bar */}
			<div className="md:hidden mt-4">
				<form onSubmit={handleSearchSubmit}>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-4 w-4 text-gray-400" />
						</div>
						<input
							type="text"
							value={searchQuery}
							onChange={handleSearchChange}
							placeholder="Search dashboard..."
							className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
							aria-label="Search dashboard"
						/>
					</div>
				</form>
			</div>
		</header>
	);
};

export default DashboardHeader;
