import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeClass =
    'text-primary-600';
  const inactiveClass = 'text-gray-500 hover:text-gray-700';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="lg:pl-64">{children}</div>
        </div>
      </main>

      {/* Mobile Menu Slide-over */}
      {import.meta.env.DEV && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" onClick={() => window.location.reload()} />
        </div>
      )}
    </div>
  );
}

export default Layout;
