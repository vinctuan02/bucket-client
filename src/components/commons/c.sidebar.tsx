'use client';

import { useAppConfigStore } from '@/modules/app-config/app-config.store';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { APP_PERMISSIONS } from '@/modules/permissions/permission.constant';
import {
	CircleUserRound,
	CreditCard,
	Folder,
	KeyRound,
	LayoutDashboard,
	Settings,
	Share2,
	Shield,
	Trash2,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import './c.sidebar.scss';
import StorageDisplay from './c.storage-display';

interface SidebarItem {
	display: string;
	icon: React.ReactNode;
	to: string;
	section: string;
	requiredPermission?: {
		action: string;
		resource: string;
	};
}

const sidebarNavItems: SidebarItem[] = [
	{
		display: 'Dashboard',
		icon: <LayoutDashboard size={18} strokeWidth={2.5} />,
		to: '/dashboard',
		section: 'dashboard',
		requiredPermission: APP_PERMISSIONS.READ_DASHBOARD,
	},
	{
		display: 'Home',
		icon: <Folder size={18} strokeWidth={2.5} />,
		to: '/home',
		section: 'home',
		requiredPermission: APP_PERMISSIONS.READ_FILE_NODE,
	},
	{
		display: 'Users',
		icon: <Users size={18} strokeWidth={2.5} />,
		to: '/users',
		section: 'users',
		requiredPermission: APP_PERMISSIONS.READ_USER,
	},
	{
		display: 'Roles',
		icon: <Shield size={18} strokeWidth={2.5} />,
		to: '/roles',
		section: 'roles',
		requiredPermission: APP_PERMISSIONS.READ_ROLE,
	},
	{
		display: 'Permissions',
		icon: <KeyRound size={18} strokeWidth={2.5} />,
		to: '/permissions',
		section: 'permissions',
		requiredPermission: APP_PERMISSIONS.READ_PERMISSION,
	},
	{
		display: 'App Config',
		icon: <Settings size={18} strokeWidth={2.5} />,
		to: '/app-config',
		section: 'app-config',
		requiredPermission: APP_PERMISSIONS.READ_CONFIG,
	},
	{
		display: 'Profile',
		icon: <CircleUserRound size={18} strokeWidth={2.5} />,
		to: '/my-profile',
		section: 'my-profile',
	},
	{
		display: 'Plans',
		icon: <CreditCard size={18} strokeWidth={2.5} />,
		to: '/plans',
		section: 'plans',
		requiredPermission: APP_PERMISSIONS.READ_PLAN,
	},

	{
		display: 'Payment',
		icon: <CreditCard size={18} strokeWidth={2.5} />,
		to: '/payment',
		section: 'payment',
		requiredPermission: APP_PERMISSIONS.READ_SUBSCRIPTION,
	},
	// {
	// 	display: 'Payment History',
	// 	icon: <History size={18} strokeWidth={2.5} />,
	// 	to: '/payment/history',
	// 	section: 'payment',
	// 	requiredPermission: APP_PERMISSIONS.READ_SUBSCRIPTION,
	// },
	{
		display: 'Shared With Me',
		icon: <Share2 size={18} strokeWidth={2.5} />,
		to: '/share-with-me',
		section: 'share-with-me',
		requiredPermission: APP_PERMISSIONS.READ_FILE_NODE,
	},
	// {
	// 	display: 'Storage',
	// 	icon: <CreditCard size={18} strokeWidth={2.5} />,
	// 	to: '/storage',
	// 	section: 'storage',
	// 	requiredPermission: APP_PERMISSIONS.READ_STORAGE,
	// },
	{
		display: 'Trash',
		icon: <Trash2 size={18} strokeWidth={2.5} />,
		to: '/trash',
		section: 'trash',
		requiredPermission: APP_PERMISSIONS.READ_TRASH,
	},
];

export default function Sidebar() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [stepHeight, setStepHeight] = useState(0);
	const [visibleItems, setVisibleItems] = useState<SidebarItem[]>([]);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();
	const { user, hasPermission } = useAuthStore();
	const { config, fetchConfig } = useAppConfigStore();

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		// Filter sidebar items based on user permissions
		if (!user) {
			setVisibleItems([]);
			return;
		}

		const filtered = sidebarNavItems.filter((item) => {
			// If no permission required, show the item
			if (!item.requiredPermission) {
				return true;
			}

			// Check if user has the required permission
			return hasPermission(
				item.requiredPermission.action,
				item.requiredPermission.resource,
			);
		});

		setVisibleItems(filtered);
	}, [user]);

	useEffect(() => {
		// set chiều cao cho indicator
		setTimeout(() => {
			const sidebarItem = sidebarRef.current?.querySelector(
				'.sidebar__menu__item',
			) as HTMLElement;
			if (sidebarItem && indicatorRef.current) {
				indicatorRef.current.style.height = `${sidebarItem.clientHeight}px`;
				setStepHeight(sidebarItem.clientHeight);
			}
		}, 100);
	}, [visibleItems]);

	useEffect(() => {
		const curPath = pathname.split('/')[1];
		const activeItem = visibleItems.findIndex(
			(item) => item.section === curPath,
		);
		setActiveIndex(curPath.length === 0 ? 0 : activeItem);
	}, [pathname, visibleItems]);

	return (
		<div className="sidebar">
			<div className="sidebar__logo">
				{config?.icon && (
					<img
						src={config.icon}
						alt="App Icon"
						style={{
							width: '24px',
							height: '24px',
							marginRight: '8px',
							objectFit: 'contain',
						}}
					/>
				)}
				CloudBox
			</div>
			<div ref={sidebarRef} className="sidebar__menu">
				<div
					ref={indicatorRef}
					className="sidebar__menu__indicator"
					style={{
						transform: `translateX(-50%) translateY(${
							activeIndex * stepHeight
						}px)`,
					}}
				></div>
				{visibleItems.map((item, index) => (
					<Link href={item.to} key={index}>
						<div
							className={`sidebar__menu__item ${
								activeIndex === index ? 'active' : ''
							}`}
						>
							<div className="sidebar__menu__item__icon">
								{item.icon}
							</div>
							<div className="sidebar__menu__item__text">
								{item.display}
							</div>
						</div>
					</Link>
				))}
			</div>
			<StorageDisplay />
		</div>
	);
}
