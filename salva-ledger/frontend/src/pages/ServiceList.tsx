import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { servicesApi, ServiceStatus } from '../services/api';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import Button from '../components/Button';
import FloatingActionButton from '../components/FloatingActionButton';

interface ServicesResponse {
  content: {
    id: string;
    number: number;
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
  }[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

function ServiceList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | ''>('');
  const [page, setPage] = useState(0);

  // Fetch services with proper pagination
  const { data, isLoading, error, refetch } = useQuery<ServicesResponse>({
    queryKey: ['services', page, search, statusFilter],
    queryFn: () =>
      servicesApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
    staleTime: 5000, // Refresh after 5 seconds
  });

  // Handle search change - reset to page 0 and refetch
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(0);
      refetch();
    },
    [refetch]
  );

  // Handle status filter change - reset to page 0 and refetch
  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value as ServiceStatus || '');
      setPage(0);
      refetch();
    },
    [refetch]
  );

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handleServiceClick = (id: string) => {
    navigate(`/services/${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      servicesApi.delete(id).then(() => {
        refetch();
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load services. Please try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all transport services
            </p>
          </div>
          <Button onClick={() => navigate('/services/new')}>
            Add Service
          </Button>
        </div>
      </div>

      <div id="services-list-container" onScroll={() => {}}>
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm touch-manipulation bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter || ''}
            onChange={handleStatusFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm touch-manipulation bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Mobile-first card list */}
        <div className="space-y-3">
          {data?.content?.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleServiceClick(service.id)}
              onDelete={() => handleDelete(service.id)}
            />
          ))}
        </div>

        {/* Infinite scroll loading indicator */}
        {page < data?.totalPages && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              Loading more services...
            </div>
          </div>
        )}

        {/* Load more button */}
        {page < data?.totalPages && (
          <div className="text-center py-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleLoadMore}
            >
              Load More Services
            </Button>
          </div>
        )}

        {/* Empty state */}
        {(!data?.content || data.content.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-lg font-medium">No services found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
            {(search || statusFilter) && (
              <Button
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  refetch();
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Floating action button for mobile */}
      <FloatingActionButton onClick={() => navigate('/services/new')} />

      {/* Show page indicator on desktop only */}
      <div className="hidden sm:block mt-4 text-center text-sm text-gray-500">
        Showing services {data?.content?.length || 0}
        {page < data?.totalPages && (
          <>
            {' '}of {data.totalElements || 0} ({data.totalPages + 1} pages)
          </>
        )}
      </div>
    </Layout>
  );
}

export default ServiceList;
