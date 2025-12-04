'use client';

import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import {
	CircleUserRound,
	CreditCard,
	Folder,
	KeyRound,
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
	requiredRoles?: string[];
}

const sidebarNavItems: SidebarItem[] = [
	{
		display: 'Home',
		icon: <Folder size={18} strokeWidth={2.5} />,
		to: '/home',
		section: 'home',
		requiredRoles: ['Admin', 'User', 'Sale'],
	},
	{
		display: 'Users',
		icon: <Users size={18} strokeWidth={2.5} />,
		to: '/users',
		section: 'users',
		requiredRoles: ['Admin'],
	},
	{
		display: 'Roles',
		icon: <Shield size={18} strokeWidth={2.5} />,
		to: '/roles',
		section: 'roles',
		requiredRoles: ['Admin'],
	},
	{
		display: 'Permissions',
		icon: <KeyRound size={18} strokeWidth={2.5} />,
		to: '/permissions',
		section: 'permissions',
		requiredRoles: ['Admin'],
	},
	{
		display: 'App Config',
		icon: <Settings size={18} strokeWidth={2.5} />,
		to: '/app-config',
		section: 'app-config',
		requiredRoles: ['Admin'],
	},
	{
		display: 'Profile',
		icon: <CircleUserRound size={18} strokeWidth={2.5} />,
		to: '/my-profile',
		section: 'my-profile',
		requiredRoles: ['Admin', 'User', 'Sale'],
	},
	{
		display: 'Plans',
		icon: <CreditCard size={18} strokeWidth={2.5} />,
		to: '/plans',
		section: 'plans',
		requiredRoles: ['Admin', 'Sale'],
	},
	{
		display: 'Shared With Me',
		icon: <Share2 size={18} strokeWidth={2.5} />,
		to: '/share-with-me',
		section: 'share-with-me',
		requiredRoles: ['Admin', 'User', 'Sale'],
	},
	{
		display: 'Storage',
		icon: <CreditCard size={18} strokeWidth={2.5} />,
		to: '/storage',
		section: 'storage',
		requiredRoles: ['Admin', 'User'],
	},
	{
		display: 'Trash',
		icon: <Trash2 size={18} strokeWidth={2.5} />,
		to: '/trash',
		section: 'trash',
		requiredRoles: ['Admin', 'User'],
	},
];

export default function Sidebar() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [stepHeight, setStepHeight] = useState(0);
	const [visibleItems, setVisibleItems] = useState<SidebarItem[]>([]);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();
	const { user } = useAuthStore();

	useEffect(() => {
		// Filter sidebar items based on user roles
		if (!user) {
			setVisibleItems([]);
			return;
		}

		const userRoles =
			(user.userRoles
				?.map((ur) => ur.role?.name)
				.filter(Boolean) as string[]) || [];
		const filtered = sidebarNavItems.filter((item) => {
			if (!item.requiredRoles || item.requiredRoles.length === 0) {
				return true;
			}
			return userRoles.some((role) => item.requiredRoles?.includes(role));
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
			<div className="sidebar__logo">CloudBox</div>
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
