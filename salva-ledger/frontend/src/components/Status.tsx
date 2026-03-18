import { ServiceStatus } from '../services/api';

interface StatusProps {
  status: ServiceStatus | string;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

function Status({ status, onClick, size = 'md' }: StatusProps) {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case ServiceStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
      case ServiceStatus.PENDING:
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
      case ServiceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case ServiceStatus.COMPLETED:
        return '✓ Completed';
      case ServiceStatus.PENDING:
        return '⏳ Pending';
      case ServiceStatus.CANCELLED:
        return '✕ Cancelled';
      default:
        return s;
    }
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium cursor-pointer transition-colors border touch-manipulation select-none ${getStatusStyles(status)} ${sizeStyles[size]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export default Status;
