import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
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
        <select
          ref={ref}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white touch-manipulation transition-colors appearance-none ${
            error ? 'border-danger' : ''
          } ${className}`}
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
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
