'use client';

import { useAppConfigStore } from '@/modules/app-config/app-config.store';
import { useEffect } from 'react';

export default function DynamicFavicon() {
	const { config, fetchConfig } = useAppConfigStore();

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		if (config?.icon) {
			// Update favicon
			let link: HTMLLinkElement | null =
				document.querySelector("link[rel*='icon']");

			if (!link) {
				link = document.createElement('link');
				link.rel = 'icon';
				document.head.appendChild(link);
			}

			link.href = config.icon;
		}
	}, [config?.icon]);

	return null; // This component doesn't render anything
}
