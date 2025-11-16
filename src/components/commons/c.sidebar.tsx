'use client';

import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import {
	CircleUserRound,
	Folder,
	KeyRound,
	Settings,
	Shield,
	Users,
	CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import './c.sidebar.scss';

const sidebarNavItems = [
	{
		display: 'Home',
		icon: <Folder size={18} strokeWidth={2.5} />,
		to: '/home',
		section: 'home',
	},
	// {
	// 	display: 'Share',
	// 	icon: <Folder size={18} strokeWidth={2.5} />,
	// 	to: '/share',
	// 	section: 'share',
	// },
	{
		display: 'Users',
		icon: <Users size={18} strokeWidth={2.5} />,
		to: '/users',
		section: 'users',
	},
	{
		display: 'Roles',
		icon: <Shield size={18} strokeWidth={2.5} />,
		to: '/roles',
		section: 'roles',
	},
	{
		display: 'Permissions',
		icon: <KeyRound size={18} strokeWidth={2.5} />,
		to: '/permissions',
		section: 'permissions',
	},
	{
		display: 'App Config',
		icon: <Settings size={18} strokeWidth={2.5} />,
		to: '/app-config',
		section: 'app-config',
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
	},
	{
		display: 'Test',
		icon: <CircleUserRound size={18} strokeWidth={2.5} />,
		to: '/test',
		section: 'test',
	},
];

export default function Sidebar() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [stepHeight, setStepHeight] = useState(0);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();
	const hasPermission = useAuthStore((s) => s.hasPermission);

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
	}, []);

	useEffect(() => {
		const curPath = pathname.split('/')[1];
		const activeItem = sidebarNavItems.findIndex(
			(item) => item.section === curPath,
		);
		setActiveIndex(curPath.length === 0 ? 0 : activeItem);
	}, [pathname]);

	return (
		<div className="sidebar">
			<div className="sidebar__logo">CloudBox</div>
			<div ref={sidebarRef} className="sidebar__menu">
				<div
					ref={indicatorRef}
					className="sidebar__menu__indicator"
					style={{
						transform: `translateX(-50%) translateY(${activeIndex * stepHeight
							}px)`,
					}}
				></div>
				{sidebarNavItems.map((item, index) => (
					<Link href={item.to} key={index}>
						<div
							className={`sidebar__menu__item ${activeIndex === index ? 'active' : ''
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

				{/* {sidebarNavItems.map((item, index) => {
					// check quyền cho từng menu
					const requiredPermissions: Record<
						string,
						[string, string]
					> = {
						users: ['read', 'user'],
						roles: ['read', 'role'],
						permissions: ['read', 'permission'],
						'app-config': ['read', 'config'],
						'my-profile': ['read', 'profile'],
					};

					const [action, resource] =
						requiredPermissions[item.section] || [];
					const canAccess =
						!action || !resource || hasPermission(action, resource);

					if (!canAccess) return null;

					return (
						<Link href={item.to} key={index}>
							<div
								className={`sidebar__menu__item ${activeIndex === index ? 'active' : ''}`}
							>
								<div className="sidebar__menu__item__icon">
									{item.icon}
								</div>
								<div className="sidebar__menu__item__text">
									{item.display}
								</div>
							</div>
						</Link>
					);
				})} */}
			</div>
		</div>
	);
}
