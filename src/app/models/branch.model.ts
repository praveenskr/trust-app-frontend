export interface BranchCreateDTO {
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  isActive?: boolean;
}

export interface BranchDTO {
  id: number;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchUpdateDTO {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  isActive?: boolean;
}

