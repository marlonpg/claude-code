import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServiceList from './pages/ServiceList';
import ServiceForm from './pages/ServiceForm';
import ExpenseList from './pages/ExpenseList';
import ExpenseForm from './pages/ExpenseForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<ServiceList />} />
              <Route path="/services/new" element={<ServiceForm />} />
              <Route path="/services/:id" element={<ServiceForm />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/expenses/new" element={<ExpenseForm />} />
              <Route path="/expenses/:id" element={<ExpenseForm />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
