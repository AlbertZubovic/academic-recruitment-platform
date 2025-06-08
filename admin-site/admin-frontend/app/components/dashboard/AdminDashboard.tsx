'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '../../graphql/queries';
import CourseManagement from '../CourseManagement';
import UserManagement from '../UserManagement';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard statistics
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_DASHBOARD_STATS);

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">TT Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'courses', label: 'Course Management' },
              { id: 'users', label: 'User Management' },
              { id: 'reports', label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'overview' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Dashboard Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900">Total Courses</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {statsLoading ? '...' : (statsData?.dashboardStats?.totalCourses ?? 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900">Total Students</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {statsLoading ? '...' : (statsData?.dashboardStats?.totalStudents ?? 0)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-900">Total Lecturers</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {statsLoading ? '...' : (statsData?.dashboardStats?.totalLecturers ?? 0)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-900">Blocked Users</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {statsLoading ? '...' : (statsData?.dashboardStats?.blockedUsers ?? 0)}
                    </p>
                  </div>
                </div>

                {statsError && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Error loading dashboard stats: {statsError.message}
                  </div>
                )}
                <div className="mt-6">
                  <p className="text-gray-600">
                    Welcome to the TT Admin Dashboard. Use the navigation above to manage courses, users, and view reports.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <CourseManagement />
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {activeTab === 'reports' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Reports
                </h3>
                <p className="text-gray-600">
                  Reporting functionality will be implemented here.
                  This will include candidate reports and analytics.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 