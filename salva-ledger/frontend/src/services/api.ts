import { useQuery, useMutation, useQueryClient, useTransition, useInfinite } from '@tanstack/react-query';
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

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
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Auth mutation hooks
export function useLogin() {
  const [isPending, startTransition] = useTransition();

  const mutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.userId,
        email: data.email,
        role: data.role,
      }));
    },
    onError: (error) => {
      // Don't clear storage on rememberMe - let client handle it
    },
  });

  return mutation;
}

// Services API
export const servicesApi = {
  getAll: ({
    page = 0,
    size = 10,
    search,
    status,
  }?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
  }) =>
    axiosInstance.get(`/services?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${status}` : ''}`),

  // Infinite scroll endpoint - fetch next page without search/status filters
  getInfinite: (lastPage: number) =>
    axiosInstance.get(`/services?page=${lastPage}&size=10`),

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
export const dashboardApi = () => axiosInstance.get('/dashboard/current') as Promise<DashboardData>;

// Dashboard API - for specific month
export const dashboardApiByMonth = (year: number, month: number) =>
  axiosInstance.get('/dashboard', { params: { year, month } }) as Promise<DashboardData>;

// Dashboard API - for date range
export const dashboardApiByDateRange = (
  startDate: string,
  endDate: string
) => axiosInstance.get('/dashboard/range', { params: { startDate, endDate } }) as Promise<DashboardData>;

// Veterinarians API
export const vetsApi = {
  getAll: () => axiosInstance.get<VeterinarianDTO[]>('/veterinarians'),
  getById: (id: string) => axiosInstance.get<VeterinarianDTO>(`/veterinarians/${id}`),
  create: (vet: Partial<VeterinarianDTO>) => axiosInstance.post('/veterinarians', vet) as Promise<VeterinarianDTO>,
  update: (id: string, vet: Partial<VeterinarianDTO>) => axiosInstance.put(`/veterinarians/${id}`, vet) as Promise<VeterinarianDTO>,
  delete: (id: string) => axiosInstance.delete(`/veterinarians/${id}`),
};

// Drivers API
export const driversApi = {
  getAll: () => axiosInstance.get<DriverDTO[]>('/drivers'),
  getById: (id: string) => axiosInstance.get<DriverDTO>(`/drivers/${id}`),
  create: (driver: Partial<DriverDTO>) => axiosInstance.post('/drivers', driver) as Promise<DriverDTO>,
  update: (id: string, driver: Partial<DriverDTO>) => axiosInstance.put(`/drivers/${id}`, driver) as Promise<DriverDTO>,
  delete: (id: string) => axiosInstance.delete(`/drivers/${id}`),
};

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
    return { success: response.data.success || true, data: response.data };
  },

  register: (data: RegisterRequest) => axiosInstance.post('/auth/register', data),

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
  success: boolean;
  message?: string;
  token: string;
  userId: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_ASSISTANT' | 'ROLE_DRIVER' | 'ROLE_USER';
  full_name?: string;
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

// Expense mutations
export const useExpenseCreate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ExpenseDTO, Error, ExpenseDTO>({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  return {
    ...mutation,
    isCreating: mutation.isPending,
  };
};

export const useExpenseUpdate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ExpenseDTO, Error, string, Partial<ExpenseDTO>>({
    mutationFn: ({ id, variables }: { id: string; variables: Partial<ExpenseDTO> }) =>
      expensesApi.update(id, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  return {
    ...mutation,
    isUpdating: mutation.isPending,
  };
};

// Hook wrappers
export function useServices(options?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['services', options],
    queryFn: () => servicesApi.getAll(options),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getById(id),
  });
}

export const useServiceCreate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ServiceDTO, Error, ServiceDTO>({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    ...mutation,
    isCreating: mutation.isPending,
  };
};

export const useServiceUpdate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ServiceDTO, Error, string, Partial<ServiceDTO>>({
    mutationFn: ({ id, variables }: { id: string; variables: Partial<ServiceDTO> }) =>
      servicesApi.update(id, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    ...mutation,
    isUpdating: mutation.isPending,
  };
};

export const useServiceDelete = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    ...mutation,
    isDeleting: mutation.isPending,
  };
};

export const useVets = () => {
  return useQuery({
    queryKey: ['veterinarians'],
    queryFn: () => vetsApi.getAll(),
  });
};

export const useVetUpdate = () => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const mutation = useMutation<VeterinarianDTO, Error, string, Partial<VeterinarianDTO>>({
    mutationFn: ({ id, variables }: { id: string; variables: Partial<VeterinarianDTO> }) =>
      vetsApi.update(id, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinarians'] });
    },
  });

  return {
    ...mutation,
    isUpdating: isPending,
  };
};

export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversApi.getAll(),
  });
};

export const useDriverUpdate = () => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const mutation = useMutation<DriverDTO, Error, string, Partial<DriverDTO>>({
    mutationFn: ({ id, variables }: { id: string; variables: Partial<DriverDTO> }) =>
      driversApi.update(id, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  return {
    ...mutation,
    isUpdating: isPending,
  };
};

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

export function useDashboardByDateRange(startDate: string, endDate: string) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', 'date-range', startDate, endDate],
    queryFn: () => dashboardApiByDateRange(startDate, endDate),
  });
}

export function useDashboardByMonth(year: number, month: number) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', 'month', year, month],
    queryFn: () => dashboardApiByMonth(year, month),
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

// Infinite scroll hook wrapper
export function useServicesInfinite({
  size = 10,
  search,
  status,
}: { size?: number; search?: string; status?: string } = {}) {
  const fetchNextPage = async () => {
    const nextPage = (fetchNextPage.currentPage || 0) + 1;

    return servicesApi.getInfinite(nextPage).then((page) => {
      fetchNextPage.currentPage = nextPage;
      return page;
    });
  };

  // Store current page count using a side effect
  let currentPage = 0;

  return useInfinite({
    queryKey: ['services', 'infinite', search, status],
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const last = lastPage.last || 0;
      const hasMore = last < (lastPage.totalElements || 0) - size;
      return hasMore ? last + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => 0,
  });
}

// Type for page data
export interface PageService {
  content: ServiceDTO[];
  last?: number;
  totalElements?: number;
}

export function useLogin() {
  const [isPending, startTransition] = useTransition();

  const mutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.userId,
        email: data.email,
        role: data.role,
      }));
    },
  });

  return mutation;
}

export function useRegister() {
  const [isPending, startTransition] = useTransition();

  const mutation = useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.userId,
        email: data.email,
        role: data.role,
      }));
    },
  });

  return mutation;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getUserInfo = async (): Promise<ApiResponse<UserInfo>> => {
  const response = await axiosInstance.get<UserInfo>('/auth/me');
  return { success: true, data: response.data };
};
