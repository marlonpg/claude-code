export enum ExpenseCategory {
  FUEL = 'FUEL',
  MAINTENANCE = 'MAINTENANCE',
  EQUIPMENT = 'EQUIPMENT',
  TAX = 'TAX',
  OTHER = 'OTHER',
}

export interface ExpenseDTO {
  id?: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface ExpenseListResponse {
  content: ExpenseDTO[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}
