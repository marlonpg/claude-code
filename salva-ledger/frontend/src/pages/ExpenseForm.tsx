import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expensesApi, ExpenseDTO, useExpenses } from '../services/api';
import { ExpenseCategory } from '../types/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import InputField from '../components/InputField';

const expenseCategories = [
  { value: ExpenseCategory.FUEL, label: 'Fuel' },
  { value: ExpenseCategory.MAINTENANCE, label: 'Maintenance' },
  { value: ExpenseCategory.EQUIPMENT, label: 'Equipment' },
  { value: ExpenseCategory.TAX, label: 'Tax' },
  { value: ExpenseCategory.OTHER, label: 'Other' },
] as const;

type ExpenseFormData = Omit<ExpenseDTO, 'id'>;

const ExpenseForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();

  // Check if we're in edit mode based on URL params
  const isEdit = !!id && !location.pathname.endsWith('/new');

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>(expenseCategories[0].value);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Fetch expenses for editing
  const { data: expenseList } = useExpenses({ page: 0, size: 100 });

  // Get existing expense when needed
  const existingExpense = id ? expenseList?.content?.find((e) => e.id === id) : undefined;

  // Create expense mutation
  const createMutation = useMutation<ExpenseDTO, Error, ExpenseFormData>({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  // Update expense mutation
  const updateMutation = useMutation<ExpenseDTO, Error, string, Partial<ExpenseDTO>>({
    mutationFn: ({ id, variables }: { id: string; variables: Partial<ExpenseDTO> }) =>
      expensesApi.update(id, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const handleSave = useCallback(
    async (formData: ExpenseFormData) => {
      try {
        if (isEdit && id && existingExpense) {
          // Update existing expense
          await updateMutation.mutateAsync({ id, variables: existingExpense });
        } else {
          // Create new expense
          await createMutation.mutateAsync(formData);
        }
        navigate('/expenses');
      } catch (error) {
        console.error('Failed to save expense:', error);
      }
    },
    [id, isEdit, queryClient, createMutation, updateMutation, existingExpense]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: Record<string, string> = {};

    if (description.trim().length < 3) {
      errors.description = 'Description must be at least 3 characters';
    }

    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!category) {
      errors.category = 'Please select a category';
    }

    if (!date) {
      errors.date = 'Date is required';
    }

    if (Object.keys(errors).length > 0) {
      // Show validation errors
      Object.entries(errors).forEach(([key, value]) => {
        console.error(`${key}: ${value}`);
      });
      return;
    }

    const formData = {
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date,
    };

    await handleSave(formData);
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Expense' : 'Add Expense'}
            </h1>
            <p className="text-gray-600 mt-1">Record an operational expense</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/expenses')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Gas for client pickup"
              className="touch-manipulation text-base"
              required
            />
            <p className="text-xs text-gray-500">
              Briefly describe the expense
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <InputField
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="touch-manipulation text-base"
              required
            />
            <p className="text-xs text-gray-500">
              Enter the expense amount
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              options={expenseCategories}
              className="touch-manipulation text-base"
              required
            />
            <p className="text-xs text-gray-500">
              Categorize your expense
            </p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <InputField
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="touch-manipulation text-base"
              required
            />
            <p className="text-xs text-gray-500">
              Default is today
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              {isEdit ? 'Update Expense' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default ExpenseForm;
