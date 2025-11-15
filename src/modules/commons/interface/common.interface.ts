export interface IConfigTableColumn {
	label: string;
	field: string;
	orderField?: string;
	width?: number;
	render?: (value: any, record: any) => React.ReactNode;
}

export interface PaginationInfo {
	page: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}
