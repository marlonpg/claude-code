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
