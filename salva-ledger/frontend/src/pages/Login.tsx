import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

function Login() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, userInfo } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    navigate('/dashboard');
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    if (isLoading) return;

    try {
      setError(null);
      await login({ email, password, rememberMe });

      // Optionally fetch user info after successful login (optional refresh of user data)
      // await fetchUserInfo();

      navigate('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid email or password. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-8 sm:py-12 no-print">
      <Card className="w-full max-w-md p-6 sm:p-8 animate-fade-in bg-white">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4 mx-auto">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vet Transport</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              required
              className="w-full touch-manipulation h-12 text-base"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-primary-600 hover:text-primary-500 touch-manipulation focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              {...(showPassword && { className: "w-full touch-manipulation h-12 text-base" })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                className="w-5 h-5 sm:w-4 sm:h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm text-primary-600 hover:text-primary-500 touch-manipulation"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a
              href="#"
              className="text-primary-600 hover:text-primary-500 font-medium touch-manipulation"
            >
              Contact admin
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Login;
