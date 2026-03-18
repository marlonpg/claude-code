import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      name: 'Services',
      href: '/services',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      name: 'Add Service',
      href: '/services/new',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
  ];

  const getActiveClass = (item: typeof navItems[0]) =>
    location.pathname === item.href ? activeClass : inactiveClass;

  return (
    <div className="w-64 border-r border-gray-200 bg-white hidden lg:block">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-900">
            Navigation
          </h2>
        </div>

        <nav>
          <ul role="list" className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${getActiveClass(
                    item
                  )}`}
                >
                  <span className="text-primary-600">
                    {item.icon}
                  </span>
                  <span className="ml-3">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="px-4 py-4 border-t border-gray-200">
        <div className="bg-primary-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary-900 mb-1">
            Need help?
          </h3>
          <p className="text-xs text-primary-700">
            Contact the administrator for support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
