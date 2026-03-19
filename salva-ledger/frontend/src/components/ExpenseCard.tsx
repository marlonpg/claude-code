import React from 'react';
import { ExpenseCategory } from '../types/api';

interface ExpenseCardProps {
  expense: {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
  };
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  FUEL: 'bg-orange-100 text-orange-800 border-orange-200',
  MAINTENANCE: 'bg-blue-100 text-blue-800 border-blue-200',
  EQUIPMENT: 'bg-purple-100 text-purple-800 border-purple-200',
  TAX: 'bg-red-100 text-red-800 border-red-200',
  OTHER: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onDelete,
  onEdit,
}) => {
  const categoryColor = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER;

  return (
    <div className="group bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-gray-900">{expense.description}</div>
          <div className="text-sm text-gray-500">
            {new Date(expense.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-danger">${expense.amount.toFixed(2)}</div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryColor}`}
            >
              {expense.category}
            </span>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(expense.id)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(expense.id)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
