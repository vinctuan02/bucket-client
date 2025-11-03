export interface IConfigTableColumn {
	label: string;
	field: string;
	orderField?: string;
	width?: number;
}

export interface PaginationInfo {
	page: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}
