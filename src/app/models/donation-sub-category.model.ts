export interface DonationSubCategoryCreateDTO {
  purposeId: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DonationSubCategoryDTO {
  id: number;
  purposeId: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonationSubCategoryUpdateDTO {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

