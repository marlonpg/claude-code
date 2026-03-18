import { useState, useCallback } from 'react';
import { useInfinite } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { servicesApi, ServiceStatus } from '../services/api';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import Button from '../components/Button';
import FloatingActionButton from '../components/FloatingActionButton';
import { PageService } from '../services/api';

function ServiceList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Use useInfinite hook for infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfinite({
    queryKey: ['services', 'infinite', search, statusFilter],
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const last = lastPage.last || 0;
      // Load more if there are more services to fetch
      return last < (lastPage.totalElements || 0) - 10 ? last + 1 : undefined;
    },
    getPreviousPageParam: (firstPage, pages) => 0,
  });

  // Combine all pages into a single array
  const allPages = data || [];
  const allServices = allPages.flatMap((page) => page.content || []);

  // Calculate pagination info
  const totalPages = Math.ceil(allServices.length / 10);
  const currentPage = Math.min(Math.floor(allServices.length / 10) + 1, totalPages);

  // Check if we're near the bottom
  const lastPage = allPages[allPages.length - 1] || {};
  const last = lastPage.last || 0;
  const hasMore = last < (lastPage.totalElements || 0) - 10;

  // Load more on scroll
  const handleScroll = useCallback(() => {
    const target = document.getElementById('services-list-container');
    if (target) {
      const { scrollTop, scrollHeight, clientHeight } = target;
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  // Also provide manual load more function
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Reset when search changes
    const newData = [...data];
    newData[0] = { content: [], meta: data[0]?.meta };
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value || undefined);
    // Reset when filter changes
    const newData = [...data];
    newData[0] = { content: [], meta: data[0]?.meta };
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
          <Button onClick={() => navigate('/services/new')} variant="secondary">
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

      <div id="services-list-container" onScroll={handleScroll}>
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
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
          {allServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => navigate(`/services/${service.id}`)}
            />
          ))}
        </div>

        {/* Infinite scroll loading indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
              Loading more services...
            </div>
          </div>
        )}

        {/* Load more button (optional fallback) */}
        {hasMore && !isFetchingNextPage && (
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
        {allServices.length === 0 && (
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
                  setStatusFilter(undefined);
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
        Showing services {allServices.length}
        {hasMore && (
          <>
            {' '}of {lastPage.totalElements || allServices.length}
            {' '}({Math.ceil((allServices.length - 1) / 10) + 1} pages)
          </>
        )}
      </div>
    </Layout>
  );
}

export default ServiceList;
