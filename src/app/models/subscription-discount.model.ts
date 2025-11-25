export interface SubscriptionDiscountCreateDTO {
  planId: number;
  discountType: string; // PERCENTAGE, FIXED
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  validFrom: string; // ISO date string
  validTo?: string; // ISO date string
  isActive?: boolean;
}

export interface SubscriptionDiscountDTO {
  id: number;
  planId: number;
  discountType: string; // PERCENTAGE, FIXED
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  validFrom: string; // ISO date string
  validTo?: string; // ISO date string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionDiscountUpdateDTO {
  planId: number;
  discountType: string; // PERCENTAGE, FIXED
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  validFrom: string; // ISO date string
  validTo?: string; // ISO date string
  isActive?: boolean;
}

export const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed' }
];

