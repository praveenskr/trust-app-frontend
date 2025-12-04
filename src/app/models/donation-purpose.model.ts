export interface DonationPurposeCreateDTO {
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DonationPurposeDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonationPurposeUpdateDTO {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DonationPurposeDropdownDTO {
  id: number;
  code: string;
  name: string;
}

