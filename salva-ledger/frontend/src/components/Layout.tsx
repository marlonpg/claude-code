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
    'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100 hover:text-primary-800';
  const inactiveClass = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
