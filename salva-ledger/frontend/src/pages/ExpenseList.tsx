import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useExpenses, expensesApi } from '../services/api';
import { ExpenseCategory } from '../types/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import ExpenseCard from '../components/ExpenseCard';

const expenseCategories = [
  { value: ExpenseCategory.FUEL, label: 'Fuel' },
  { value: ExpenseCategory.MAINTENANCE, label: 'Maintenance' },
  { value: ExpenseCategory.EQUIPMENT, label: 'Equipment' },
  { value: ExpenseCategory.TAX, label: 'Tax' },
  { value: ExpenseCategory.OTHER, label: 'Other' },
] as const;

interface ExpensesResponse {
  content: {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
  }[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

function ExpenseList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | ''>('');
  const [dateFilter, setDateFilter] = useState('');

  // Fetch expenses with proper pagination
  const { data: expensesData, isLoading, error, refetch } = useExpenses({
    page,
    size: 10,
    category: categoryFilter || undefined,
  });

  // Handle category filter change - reset to page 0
  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value as ExpenseCategory || '');
    setPage(0);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setPage(0);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleExpenseClick = (id: string) => {
    navigate(`/expenses/${id}`);
  };

  const { mutate: handleDelete, isDeleting } = useExpenseDelete();

  const handleDeleteWithConfirm = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      handleDelete(id);
    }
  };

  // Calculate total expenses for current page
  const totalExpenses = expensesData?.content?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load expenses.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-1">Track your operational expenses</p>
          </div>
          <Button onClick={() => navigate('/expenses/new')}>
            Add Expense
          </Button>
        </div>
      </div>

      <Card className="overflow-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 18rem)' }}>
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <select
              value={categoryFilter || ''}
              onChange={handleCategoryFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm touch-manipulation bg-white"
            >
              <option value="">All Categories</option>
              {expenseCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total Expenses Summary */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">Total Expenses (Month)</span>
              <span className="text-3xl font-bold text-danger mt-2">
                ${totalExpenses.toFixed(2) || '0.00'}
              </span>
            </div>
          </Card>
          <Card padding="sm" className="text-success">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">Total Expenses (All Time)</span>
              <span className="text-3xl font-bold text-success mt-2">
                ${expensesData?.content?.length
                  ? expensesData.content.reduce((sum, exp) => sum + (exp.amount || 0), 0).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </Card>
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          {expensesData?.content?.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              loading={isDeleting}
              onEdit={() => navigate(`/expenses/${expense.id}`)}
              onDelete={() => handleDelete(expense.id)}
            />
          ))}
        </div>

        {/* Empty state */}
        {(!expensesData?.content || expensesData.content.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">💵</div>
            <p className="text-lg font-medium">No expenses found</p>
            <p className="text-sm text-gray-500 mt-1">
              {categoryFilter ? `No expenses in "${expenseCategories.find(c => c.value === categoryFilter)?.label}" category` : 'Try adjusting your filters'}
            </p>
            {(categoryFilter || dateFilter) && (
              <Button
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setCategoryFilter('');
                  setDateFilter('');
                  refetch();
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {expensesData?.pageable?.pageSize > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
            <div className="text-sm text-gray-700">
              Page {expensesData.pageNumber + 1} of {expensesData.totalPages || 1}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={expensesData.pageNumber === 0}
                onClick={() => setPage(expensesData.pageNumber - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={expensesData.pageNumber === expensesData.totalPages - 1}
                onClick={() => setPage(expensesData.pageNumber + 1)}
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

export default ExpenseList;
