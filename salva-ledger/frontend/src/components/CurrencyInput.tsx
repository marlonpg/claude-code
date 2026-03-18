import { forwardRef } from 'react';

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  onValueChange?: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, prefix = '$', className = '', onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (value === '') {
        onValueChange?.(0);
      } else {
        const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(numericValue)) {
          onValueChange?.(numericValue);
        }
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
          <input
            ref={ref}
            type="text"
            className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors ${
              error ? 'border-danger' : ''
            } ${className}`}
            onChange={handleChange}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
