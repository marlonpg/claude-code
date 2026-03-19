import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Select from '../components/Select';
import ExpenseCard from '../components/ExpenseCard';
import { ExpenseCategory } from '../types/api';

const expenseCategories = [
  { value: ExpenseCategory.FUEL, label: 'Fuel' },
  { value: ExpenseCategory.MAINTENANCE, label: 'Maintenance' },
  { value: ExpenseCategory.EQUIPMENT, label: 'Equipment' },
  { value: ExpenseCategory.TAX, label: 'Tax' },
  { value: ExpenseCategory.OTHER, label: 'Other' },
] as const;

function ExpenseList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | ''>('');

  const { data: expensesData, isLoading, error } = useExpenses({
    page,
    size: 10,
    category: categoryFilter || undefined,
  });

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

  const totalExpenses = expensesData?.content?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

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
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm touch-manipulation"
            />
          </div>

          <Select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | '')}
            options={[
              { value: '', label: 'All Categories' },
              ...expenseCategories,
            ]}
          />
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card padding="sm" className="sm:col-span-2">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">Total Expenses (Month)</span>
              <span className="text-3xl font-bold text-danger mt-2">
                ${totalExpenses.toFixed(2) || '0.00'}
              </span>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {expensesData?.content?.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={(id) => navigate(`/expenses/${id}`)}
              onDelete={() => navigate('/expenses')}
            />
          ))}
        </div>

        {expensesData?.content?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No expenses found
          </div>
        )}

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
