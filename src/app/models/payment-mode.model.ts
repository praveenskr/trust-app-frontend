export interface PaymentModeCreateDTO {
  code: string;
  name: string;
  description?: string;
  requiresReceipt?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PaymentModeDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  requiresReceipt: boolean;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentModeUpdateDTO {
  code: string;
  name: string;
  description?: string;
  requiresReceipt?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PaymentModeDropdownDTO {
  id: number;
  code: string;
  name: string;
}

