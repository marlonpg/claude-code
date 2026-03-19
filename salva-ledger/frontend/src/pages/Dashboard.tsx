import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, DashboardData, dashboardApiByDateRange } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';

function Dashboard() {
  const navigate = useNavigate();

  // Get current month for dropdown
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get date range from query params or use current month
  const urlParams = new URLSearchParams(window.location.search);
  const selectedMonth = urlParams.get('month') || currentMonth.toString();
  const selectedYear = urlParams.get('year') || currentYear.toString();

  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const endDate = new Date(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`).setMonth(Number(selectedMonth) + 1)
    ? new Date(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`).setMonth(Number(selectedMonth)) + 1
    : new Date(`${selectedYear}-${String((Number(selectedMonth) % 12 + 11).toString().padStart(2, '0') + 10)}-01`).setMonth(Number(selectedMonth) + 2);

  // Format end date (last day of selected month)
  const lastDayOfMonth = new Date(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`);
  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  const endDateStr = lastDayOfMonth.toISOString().split('T')[0];

  // Use date range API
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', 'date-range', selectedYear, selectedMonth],
    queryFn: () => dashboardApiByDateRange(startDate, endDateStr),
  });

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return {
      value: `${selectedYear}-${String(m).padStart(2, '0')}`,
      label: `${m}/${selectedYear} ${i === currentMonth - 1 ? '(Current)' : ''}`,
    };
  });

  // Build the month options HTML
  const monthOptionsHtml = monthOptions.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ));

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

  const incomeColor = data.totalIncome ? 'text-success' : 'text-gray-400';
  const expenseColor = data.totalExpenses ? 'text-danger' : 'text-gray-400';

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Period: {selectedMonth}/{selectedYear}
        </p>
      </div>

      {/* Month Filter - Select */}
      <div className="mb-6">
        <select
          value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
          onChange={(e) => {
            const [year, month] = e.target.value.split('-').map(Number);
            navigate(`/dashboard?month=${month}&year=${year}`);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white touch-manipulation transition-colors appearance-none"
          style={{
            backgroundImage: 'none',
            backgroundImage: `
              linear-gradient(45deg, transparent 50%, rgba(220, 230, 250, 0.5) 50%),
              linear-gradient(-45deg, transparent 50%, rgba(220, 230, 250, 0.5) 50%)
            `,
            backgroundPosition: 'calc(100% + 0.4em) calc(100% + 0.4em),
            backgroundSize: '1em 1em, 1em 1em,
            backgroundRepeat: 'no-repeat',
          }}
        >
          {monthOptionsHtml}
        </select>
      </div>

      {/* Dashboard Data Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {/* Income Card */}
        <Card className="bg-success-50 border-success-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total Income</span>
            <span className={`text-3xl font-bold text-success-600 mt-1`}>
              ${data.totalIncome?.toFixed(2) || '0.00'}
            </span>
            {data.totalIncome && <span className="text-xs text-gray-400 mt-1">from services</span>}
          </div>
        </Card>

        {/* Expenses Card */}
        <Card className="bg-danger-50 border-danger-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total Expenses</span>
            <span className={`text-3xl font-bold text-danger-600 mt-1`}>
              ${data.totalExpenses?.toFixed(2) || '0.00'}
            </span>
            {data.totalExpenses && <span className="text-xs text-gray-400 mt-1">operational costs</span>}
          </div>
        </Card>

        {/* Profit Card */}
        <Card className={`${data.totalProfit >= 0 ? 'bg-success-50' : 'bg-danger-50'} hover:shadow-md transition-shadow duration-200`}>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total Profit</span>
            <span className={`text-3xl font-bold ${data.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'} mt-1`}>
              ${data.totalProfit?.toFixed(2) || '0.00'}
            </span>
            {data.totalProfit && <span className="text-xs text-gray-400 mt-1">net profit</span>}
          </div>
        </Card>

        {/* Pending Services Card */}
        <Card className="bg-amber-50 border-amber-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Pending Services</span>
            <span className="text-3xl font-bold text-amber-600 mt-1">
              {data.pendingServicesCount || 0}
            </span>
            <span className="text-xs text-gray-400 mt-1">awaiting attention</span>
          </div>
        </Card>

        {/* Completed Services Card */}
        <Card className="bg-success-50 border-success-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Completed Services</span>
            <span className="text-3xl font-bold text-success-600 mt-1">
              {data.completedServicesCount || 0}
            </span>
            <span className="text-xs text-gray-400 mt-1">successfully completed</span>
          </div>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/services/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
              onClick={() => navigate('/expenses/new')}
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

      {/* View All Services Link */}
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
