export interface SubscriptionPlanCreateDTO {
  code: string;
  name: string;
  planType: string; // MONTHLY, QUARTERLY, YEARLY, LIFETIME
  durationMonths?: number;
  amount: number;
  description?: string;
  isActive?: boolean;
}

export interface SubscriptionPlanDTO {
  id: number;
  code: string;
  name: string;
  planType: string; // MONTHLY, QUARTERLY, YEARLY, LIFETIME
  durationMonths?: number;
  amount: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlanUpdateDTO {
  code: string;
  name: string;
  planType: string; // MONTHLY, QUARTERLY, YEARLY, LIFETIME
  durationMonths?: number;
  amount: number;
  description?: string;
  isActive?: boolean;
}

export const PLAN_TYPES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'LIFETIME', label: 'Lifetime' }
];

