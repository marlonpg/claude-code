import Status from './Status';

interface ServiceCardProps {
  service: {
    id: string;
    description: string;
    requesterName?: string;
    totalAmount: number;
    status: string;
    netProfit: number;
    serviceDate: string;
  };
  loading?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

function ServiceCard({
  service,
  loading,
  onClick,
  onDelete,
  onComplete,
}: ServiceCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer touch-manipulation animate-fade-in hover:border-primary-300 hover:-translate-y-0.5 ${
        loading ? 'opacity-50 pointer-events-none' : ''
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-gray-900 truncate">
            {service.description || 'Unnamed service'}
          </div>
          {service.requesterName && (
            <div className="text-sm text-gray-500 truncate">
              Requested by: {service.requesterName}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {new Date(service.serviceDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col items-end">
            <div className="text-xl font-bold text-gray-900">
              ${service.totalAmount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-400">total</div>
          </div>

          <div className="flex items-center gap-2">
            <Status status={service.status} size="sm" />
            <div
              className={`text-sm font-semibold ${
                service.netProfit >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              ${service.netProfit?.toFixed(2) || '0.00'}
            </div>
          </div>

          {/* Mobile action hint */}
          <div className="sm:hidden text-xs text-gray-400">
            tap to view
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;
