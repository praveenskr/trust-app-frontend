export interface ExpenseSubCategoryCreateDTO {
  categoryId: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ExpenseSubCategoryDTO {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSubCategoryUpdateDTO {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

