export interface DonationCreateDTO {
  donorName: string;
  donorAddress?: string;
  panNumber?: string;
  donorPhone?: string;
  donorEmail?: string;
  amount: number;
  paymentModeId: number;
  purposeId: number;
  subCategoryId?: number;
  eventId?: number;
  branchId: number;
  donationDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface DonationUpdateDTO {
  donorName?: string;
  donorAddress?: string;
  panNumber?: string;
  donorPhone?: string;
  donorEmail?: string;
  amount?: number;
  paymentModeId?: number;
  purposeId?: number;
  subCategoryId?: number | null;
  eventId?: number | null;
  branchId?: number;
  donationDate?: string; // YYYY-MM-DD
  notes?: string;
}

export interface PaymentModeDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface DonationPurposeDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface DonationSubCategoryDTO {
  id: number;
  purposeId: number;
  code: string;
  name: string;
  description?: string;
}

export interface EventDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface BranchDTO {
  id: number;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email?: string;
}

export interface DonationDTO {
  id: number;
  receiptNumber: string;
  donorName: string;
  donorAddress?: string;
  panNumber?: string;
  donorPhone?: string;
  donorEmail?: string;
  amount: number;
  paymentMode: PaymentModeDTO;
  purpose: DonationPurposeDTO;
  subCategory?: DonationSubCategoryDTO;
  event?: EventDTO;
  branch: BranchDTO;
  donationDate: string;
  notes?: string;
  receiptGenerated: boolean;
  receiptGeneratedAt?: string;
  receiptFilePath?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: UserDTO;
  updatedBy?: UserDTO;
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

