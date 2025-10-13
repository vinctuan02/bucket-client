// src/types/response.ts

export interface ResponseSuccess<T = any> {
  statusCode: number;
  message: string;
  messageCode: string;
  messageWarning?: string;
  data?: T;
}

export interface ResponseError<T = any> {
  statusCode: number;
  message: string;
  messageCode: string;
  messageWarning?: string;
  data?: T;
}

export interface Metadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PageDto<T = any> {
  metadata: Metadata;
  items: T[];
}

export interface FieldErrorDetails {
  messageCode: string;
  message: string;
  page: string;
  field: string;
}
