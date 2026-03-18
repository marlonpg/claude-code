import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { DashboardData } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';

function Dashboard() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', 'current-month'],
    queryFn: () => dashboardApi(),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load dashboard data.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Go back to login
          </button>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">No data available</p>
        </div>
      </Layout>
    );
  }

  const profitColor = data.totalProfit >= 0 ? 'text-success' : 'text-danger';
  const profitBackground = data.totalProfit >= 0 ? 'bg-success-50' : 'bg-danger-50';
  const incomeColor = data.totalIncome ? 'text-success' : 'text-gray-400';
  const expenseColor = data.totalExpenses ? 'text-danger' : 'text-gray-400';

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total Income</span>
            <span className={`text-2xl font-bold ${incomeColor} mt-1`}>
              ${data.totalIncome?.toFixed(2) || '0.00'}
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total Expenses</span>
            <span className={`text-2xl font-bold ${expenseColor} mt-1`}>
              ${data.totalExpenses?.toFixed(2) || '0.00'}
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total Profit</span>
            <span className={`text-2xl font-bold ${profitColor} mt-1`}>
              ${data.totalProfit?.toFixed(2) || '0.00'}
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Pending Services</span>
            <span className="text-2xl font-bold text-primary-600 mt-1">
              {data.pendingServicesCount || 0}
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Completed Services</span>
            <span className="text-2xl font-bold text-success mt-1">
              {data.completedServicesCount || 0}
            </span>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
            Quick Actions
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/services/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <svg
                className="mr-2 h-5 w-5"
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
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate('/services')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View all services
        </button>
      </div>
    </Layout>
  );
}

export default Dashboard;
