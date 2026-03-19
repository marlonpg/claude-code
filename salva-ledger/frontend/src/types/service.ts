export interface ServiceFormData {
  description: string;
  totalAmount: number;
  requesterName: string;
  veterinarianId: string;
  driverId?: string;
  extraCost: number;
  driverCost: number;
  vetCost: number;
  serviceDate: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface ServiceFormPreview {
  description?: string;
  totalAmount?: number;
  requesterName?: string;
  veterinarianId?: string;
  driverId?: string;
  extraCost?: number;
  driverCost?: number;
  vetCost?: number;
  serviceDate?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  taxPercentage: number;
}

export interface ServiceStatus {
  PENDING: 'PENDING';
  COMPLETED: 'COMPLETED';
  CANCELLED: 'CANCELLED';
}

export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export interface ServiceResponse extends ServiceFormData {
  id?: string;
  number?: number;
  taxAmount: number;
  netProfit: number;
  veterinarian?: {
    id: string;
    name: string;
    defaultFee?: number;
  };
  driver?: {
    id: string;
    name: string;
    defaultFee?: number;
  };
}

export interface VetFormData {
  id?: string;
  name: string;
  defaultFee?: number;
  active: boolean;
}

export interface DriverFormData {
  id?: string;
  name: string;
  defaultFee?: number;
  active: boolean;
}

export interface VetsListResponse {
  content: VetFormData[];
  totalElements: number;
  last: boolean;
}

export interface DriversListResponse {
  content: DriverFormData[];
  totalElements: number;
  last: boolean;
}

export type TaxPercentage = 0.15 | 0.25 | 0.30 | 0.35 | 0.40 | 0.45 | 0.50;
export const TAX_PERCENTAGE_OPTIONS = [
  { value: 0.15, label: '15%' },
  { value: 0.25, label: '25%' },
  { value: 0.30, label: '30%' },
  { value: 0.35, label: '35%' },
  { value: 0.40, label: '40%' },
  { value: 0.45, label: '45%' },
  { value: 0.50, label: '50%' },
] as const;

export const DEFAULT_TAX_PERCENTAGE = 0.3; // 30%

export const SERVICE_DATE_DEFAULT = new Date().toISOString().split('T')[0];

// Status enum - need both type and values
export enum ServiceStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Validation functions
export const validateServiceForm = (
  data: ServiceFormData
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.description || data.description.trim().length < 3) {
    errors.description = 'Description must be at least 3 characters';
  }

  if (!data.totalAmount || data.totalAmount <= 0) {
    errors.totalAmount = 'Total amount must be greater than 0';
  }

  if (!data.requesterName || data.requesterName.trim().length < 2) {
    errors.requesterName = 'Requester name must be at least 2 characters';
  }

  if (!data.veterinarianId) {
    errors.veterinarianId = 'Please select a veterinarian';
  }

  if (!data.status) {
    errors.status = 'Status is required';
  }

  if (!data.serviceDate) {
    errors.serviceDate = 'Service date is required';
  }

  // Costs should be non-negative
  if (data.vetCost < 0) errors.vetCost = 'Vet cost cannot be negative';
  if (data.driverCost < 0) errors.driverCost = 'Driver cost cannot be negative';
  if (data.extraCost < 0) errors.extraCost = 'Extra cost cannot be negative';

  return { valid: Object.keys(errors).length === 0, errors };
};

export const calculateTotalCosts = (vetCost: number, driverCost: number, extraCost: number) =>
  vetCost + driverCost + extraCost;

export const calculateProfit = (
  totalAmount: number,
  vetCost: number,
  driverCost: number,
  extraCost: number,
  taxPercentage: number
) => {
  const taxAmount = totalAmount * taxPercentage;
  const netProfit = totalAmount - vetCost - driverCost - extraCost - taxAmount;
  return { taxAmount, netProfit };
};
