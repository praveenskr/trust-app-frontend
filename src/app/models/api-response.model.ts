export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  errorCode?: string;
  errors?: FieldErrorDetail[];
}

export interface FieldErrorDetail {
  field: string;
  message: string;
}

