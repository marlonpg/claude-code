import { ServiceStatus } from '../services/api';

interface StatusProps {
  status: ServiceStatus | string;
  onClick?: () => void;
}

function Status({ status, onClick }: StatusProps) {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case ServiceStatus.COMPLETED:
        return 'bg-success-100 text-success-800 hover:bg-success-200 border-success-200';
      case ServiceStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
      case ServiceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case ServiceStatus.COMPLETED:
        return 'Completed';
      case ServiceStatus.PENDING:
        return 'Pending';
      case ServiceStatus.CANCELLED:
        return 'Cancelled';
      default:
        return s;
    }
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${getStatusStyles(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export default Status;
