export interface ExpenseCategoryCreateDTO {
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ExpenseCategoryDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategoryUpdateDTO {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ExpenseCategoryDropdownDTO {
  id: number;
  code: string;
  name: string;
}

