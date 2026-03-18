import { useCallback } from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Floating Action Button for mobile devices
 * Fixed position button for adding new services
 */
function FloatingActionButton({
  onClick,
  children,
  className = '',
}: FloatingActionButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Prevent default to avoid opening links
      e.preventDefault();
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <button
        onClick={handleClick}
        className="group bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation focus:outline-none focus:ring-4 focus:ring-primary-300"
        aria-label="Add new service"
        type="button"
      >
        {/* Plus icon */}
        <svg
          className="h-6 w-6 sm:h-7 sm:w-7 transform group-hover:scale-110 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>

        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-primary-500 opacity-0 group-hover:opacity-20 animate-ping"></span>
      </button>
    </div>
  );
}

export default FloatingActionButton;
