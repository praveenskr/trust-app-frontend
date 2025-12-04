export interface EventCreateDTO {
  code: string;
  name: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  status?: string; // PLANNED, ACTIVE, COMPLETED, CANCELLED
  branchId?: number;
  isActive?: boolean;
}

export interface EventDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  status?: string; // PLANNED, ACTIVE, COMPLETED, CANCELLED
  branchId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventUpdateDTO {
  name: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  status?: string; // PLANNED, ACTIVE, COMPLETED, CANCELLED
  branchId?: number;
  isActive?: boolean;
}

export interface EventDropdownDTO {
  id: number;
  code: string;
  name: string;
}

export const EVENT_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

