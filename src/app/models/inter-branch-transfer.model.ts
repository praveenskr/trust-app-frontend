export interface BranchInfo {
  id: number;
  code: string;
  name: string;
}

export interface PaymentModeInfo {
  id: number;
  code: string;
  name: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

export interface InterBranchTransferDTO {
  id: number;
  transferNumber: string;
  fromBranch: BranchInfo;
  toBranch: BranchInfo;
  amount: number;
  transferDate: string;
  paymentMode: PaymentModeInfo;
  referenceNumber?: string;
  description?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: UserInfo;
  updatedBy?: UserInfo;
}

export const TRANSFER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
] as const;

export interface InterBranchTransferCreateDTO {
  fromBranchId: number;
  toBranchId: number;
  amount: number;
  transferDate: string; // ISO date string
  paymentModeId: number;
  referenceNumber?: string;
  description?: string;
  status?: string; // PENDING, COMPLETED, CANCELLED
}

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

