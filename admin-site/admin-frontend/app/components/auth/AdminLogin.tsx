'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADMIN_LOGIN } from '../../graphql/mutations/admin-mutations';
import { AdminLoginInput } from '../../types/admin';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [formData, setFormData] = useState<AdminLoginInput>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const [adminLogin, { loading }] = useMutation(ADMIN_LOGIN, {
    onCompleted: (data) => {
      if (data.adminLogin.success && data.adminLogin.token) {
        localStorage.setItem('admin-token', data.adminLogin.token);
        onLoginSuccess();
        setError('');
      } else {
        setError(data.adminLogin.message || 'Login failed');
      }
    },
    onError: (error) => {
      setError(error.message || 'An error occurred during login');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await adminLogin({
        variables: {
          username: formData.username,
          password: formData.password,
        },
      });
    } catch (err) {
      // Error is handled by onError callback
      console.error('Login error:', err);
    }
  };

  const handleInputChange = (field: keyof AdminLoginInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TT Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use credentials: admin / admin
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 