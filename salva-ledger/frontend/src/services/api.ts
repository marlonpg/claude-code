import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Services API
export const servicesApi = {
  getAll: ({ page = 0, size = 10 }?: { page?: number; size?: number }) =>
    axiosInstance.get(`/services?page=${page}&size=${size}`),

  getById: (id: string) => axiosInstance.get(`/services/${id}`),

  create: (service: Partial<ServiceDTO>) =>
    axiosInstance.post('/services', service),

  update: (id: string, service: Partial<ServiceDTO>) =>
    axiosInstance.put(`/services/${id}`, service),

  delete: (id: string) => axiosInstance.delete(`/services/${id}`),
};

// Expenses API
export const expensesApi = {
  getAll: ({
    page = 0,
    size = 10,
    category,
    startDate,
    endDate,
  }?: {
    page?: number;
    size?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    axiosInstance.get(
      `/expenses?page=${page}&size=${size}${category ? `&category=${category}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`
    ),

  getById: (id: string) => axiosInstance.get(`/expenses/${id}`),

  create: (expense: Partial<ExpenseDTO>) =>
    axiosInstance.post('/expenses', expense),

  update: (id: string, expense: Partial<ExpenseDTO>) =>
    axiosInstance.put(`/expenses/${id}`, expense),

  delete: (id: string) => axiosInstance.delete(`/expenses/${id}`),
};

// Dashboard API - current month by default
export const dashboardApi = () =>
  axiosInstance.get<DashboardData>('/dashboard/current');

// Dashboard API - for specific month
export const dashboardApiByMonth = (year: number, month: number) =>
  axiosInstance.get<DashboardData>('/dashboard', {
    params: { year, month },
  });

// Dashboard API - for date range
export const dashboardApiByDateRange = (
  startDate: string,
  endDate: string
) =>
  axiosInstance.get<DashboardData>('/dashboard/range', {
    params: { startDate, endDate },
  });

// Veterinarians API
export const vetsApi = {
  getAll: () => axiosInstance.get<VeterinarianDTO[]>('/veterinarians'),
  getById: (id: string) => axiosInstance.get<VeterinarianDTO>(`/veterinarians/${id}`),
  create: (vet: Partial<VeterinarianDTO>) => axiosInstance.post<VeterinarianDTO>('/veterinarians', vet),
  update: (id: string, vet: Partial<VeterinarianDTO>) => axiosInstance.put<VeterinarianDTO>(`/veterinarians/${id}`, vet),
  delete: (id: string) => axiosInstance.delete(`/veterinarians/${id}`),
};

// Drivers API
export const driversApi = {
  getAll: () => axiosInstance.get<DriverDTO[]>('/drivers'),
  getById: (id: string) => axiosInstance.get<DriverDTO>(`/drivers/${id}`),
  create: (driver: Partial<DriverDTO>) => axiosInstance.post<DriverDTO>('/drivers', driver),
  update: (id: string, driver: Partial<DriverDTO>) => axiosInstance.put<DriverDTO>(`/drivers/${id}`, driver),
  delete: (id: string) => axiosInstance.delete(`/drivers/${id}`),
};

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<RegisterResponse>('/auth/register', data),

  logout: () => axiosInstance.post('/auth/logout'),

  getUserInfo: () => axiosInstance.get<UserInfo>('/auth/me'),
};

// Service DTOs (mirroring backend entity)
export interface ServiceDTO {
  id?: string;
  number?: number;
  description: string;
  totalAmount: number;
  requesterName: string;
  veterinarianId: string;
  driverId?: string;
  extraCost: number;
  driverCost: number;
  vetCost: number;
  taxAmount: number;
  netProfit: number;
  status: ServiceStatus;
  serviceDate: string;
}

// Expense DTOs (mirroring backend entity)
export interface ExpenseDTO {
  id?: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

// Veterinarian DTO (mirroring backend entity)
export interface VeterinarianDTO {
  id?: string;
  name: string;
  defaultFee: number;
  active: boolean;
}

// Driver DTO (mirroring backend entity)
export interface DriverDTO {
  id?: string;
  name: string;
  defaultFee: number;
  active: boolean;
}

// Dashboard DTO (mirroring backend response with optional year/month)
export interface DashboardData {
  totalIncome: number | null;
  totalExpenses: number | null;
  totalProfit: number | null;
  pendingServicesCount: number;
  completedServicesCount: number;
  year?: number;
  month?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  email: string;
  userId: string;
  role: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  full_name?: string;
}

// Hook wrappers
export function useServices(options?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['services', options],
    queryFn: () => servicesApi.getAll(options),
    select: (data) => ({
      ...data,
      content: data.content || [],
      empty: !data.content || data.content.length === 0,
    }),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getById(id),
  });
}

export function useExpenses(options?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['expenses', options],
    queryFn: () => expensesApi.getAll(options),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'current-month'],
    queryFn: () => dashboardApi(),
  });
}

export function useVets() {
  return useQuery({
    queryKey: ['veterinarians'],
    queryFn: () => vetsApi.getAll(),
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversApi.getAll(),
  });
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authApi.login,
  });
}

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: authApi.register,
  });
}

export function useUserInfo() {
  return useQuery<UserInfo>({
    queryKey: ['user-info'],
    queryFn: () => authApi.getUserInfo(),
    staleTime: Infinity, // Never stale as long as we're authenticated
    enabled: false, // Only run when explicitly triggered
  });
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ExpenseCategory {
  FUEL = 'FUEL',
  MAINTENANCE = 'MAINTENANCE',
  EQUIPMENT = 'EQUIPMENT',
  TAX = 'TAX',
  OTHER = 'OTHER',
}
