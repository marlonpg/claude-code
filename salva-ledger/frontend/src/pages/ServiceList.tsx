import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { servicesApi, ServiceStatus } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

function ServiceList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services', page],
    queryFn: () => servicesApi.getAll({ page, size: 10 }),
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ServiceStatus.COMPLETED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            Completed
          </span>
        );
      case ServiceStatus.PENDING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case ServiceStatus.CANCELLED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
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

      <Card className="overflow-hidden">
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.content?.map((service) => (
                <tr key={service.id} onClick={() => navigate(`/services/${service.id}`)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.description}</div>
                    {service.requesterName && (
                      <div className="text-xs text-gray-500">{service.requesterName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(service.serviceDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${service.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(service.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${service.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${service.netProfit?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.content?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No services found
            </div>
          )}
        </div>

        {data?.pageable?.pageSize > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
            <div className="text-sm text-gray-700">
              Page {data.pageNumber + 1} of {data.totalPages || 1}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={data.pageNumber === 0}
                onClick={() => setPage(data.pageNumber - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={data.pageNumber === data.totalPages - 1}
                onClick={() => setPage(data.pageNumber + 1)}
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
