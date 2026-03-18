import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { servicesApi, ServiceStatus } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Status from '../components/Status';

function ServiceList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services', page, search, statusFilter],
    queryFn: () => servicesApi.getAll({ page, size: 10, search, status: statusFilter }),
  });

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

  if (servicesError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load services.</p>
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
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Service
          </Button>
        </div>
      </div>

      <Card className="overflow-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
        <div className="mb-4 flex flex-wrap gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm touch-manipulation"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm touch-manipulation bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Mobile-first card list instead of table */}
        <div className="space-y-3">
          {servicesData?.content?.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/services/${service.id}`)}
              className="group bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer touch-manipulation animate-fade-in"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-gray-900 truncate">
                    {service.description}
                  </div>
                  {service.requesterName && (
                    <div className="text-sm text-gray-500">{service.requesterName}</div>
                  )}
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(service.serviceDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-bold text-gray-900">
                      ${service.totalAmount?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-gray-500">total</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Status status={service.status} size="sm" />
                    <div className={`text-sm font-semibold ${
                      service.netProfit >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      ${service.netProfit?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <div className="sm:hidden text-xs text-gray-400">
                    tap to view
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {servicesData?.content?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No services found
          </div>
        )}

        {servicesData?.pageable?.pageSize > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
            <div className="text-sm text-gray-700">
              Page {servicesData.pageNumber + 1} of {servicesData.totalPages || 1}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={servicesData.pageNumber === 0}
                onClick={() => setPage(servicesData.pageNumber - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={servicesData.pageNumber === servicesData.totalPages - 1}
                onClick={() => setPage(servicesData.pageNumber + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
}

export default ServiceList;
