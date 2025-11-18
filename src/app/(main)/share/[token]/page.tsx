// src/modules/share/share.page.tsx
'use client';

import Page from '@/components/pages/c.page';
import Table from '@/components/tables/c.table';
import FilePreview from '@/modules/commons/components/common.c.read-file';
import { fileNodeConfigsColumnTable } from '@/modules/home/home.const';
import { FileNode } from '@/modules/home/home.entity';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shareLinkApi } from '../apis/share.api';

export default function SharePage() {
	const { token } = useParams();
	const [root, setRoot] = useState<FileNode | null>(null);
	const [children, setChildren] = useState<FileNode[]>([]);
	const [breadcrumbs, setBreadcrumbs] = useState<FileNode[]>([]);
	const [previewId, setPreviewId] = useState<string | null>(null);

	useEffect(() => {
		if (!token) return;
		(async () => {
			const { data } = await shareLinkApi.getByToken(token as string);
			setRoot(data.data.fileNode);
			if (data.data.fileNode?.type === 'folder') {
				await fetchChildren(data.data.fileNode.id);
				setBreadcrumbs([data.data.fileNode]);
			}
		})();
	}, [token]);

	const fetchChildren = async (folderId: string) => {
		const { data } = await shareLinkApi.getChildren(
			token as string,
			folderId,
		);
		setChildren(data?.items ?? []);
	};

	const handleRowClick = (row: FileNode) => {
		if (row.type === 'file') return setPreviewId(row.id);
		fetchChildren(row.id);
		setBreadcrumbs((prev) => [...prev, row]);
	};

	const handleBreadcrumbClick = async (folder: FileNode, index: number) => {
		setBreadcrumbs((prev) => prev.slice(0, index + 1));
		await fetchChildren(folder.id);
	};

	return (
		<Page title={root?.name || 'Shared'} isShowTitle={false}>
			{/* <Breadcrumbs data={breadcrumbs} onClick={handleBreadcrumbClick} /> */}

			<Table
				data={children}
				columns={fileNodeConfigsColumnTable}
				onRowClick={handleRowClick}
				// hideActions
			/>

			{previewId && (
				<FilePreview
					fileNodeId={previewId}
					onClose={() => setPreviewId(null)}
				/>
			)}
		</Page>
	);
}
