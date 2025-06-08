'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_USERS, BLOCK_USER, UNBLOCK_USER } from '../graphql/queries';
import { User } from '../types/admin';

const UserManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'candidates' | 'lecturers' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all users
  const { data: usersData, loading: usersLoading, error: usersError, refetch } = useQuery(GET_ALL_USERS);

  // Mutations for blocking/unblocking users
  const [blockUser] = useMutation(BLOCK_USER, {
    onCompleted: (data) => {
      if (data.blockUser.success) {
        refetch();
      }
    }
  });

  const [unblockUser] = useMutation(UNBLOCK_USER, {
    onCompleted: (data) => {
      if (data.unblockUser.success) {
        refetch();
      }
    }
  });

  if (usersLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-600">Loading users...</div>
          </div>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error loading users: {usersError.message}
          </div>
        </div>
      </div>
    );
  }

  const users: User[] = usersData?.users || [];

  // Filter users based on active view and search term
  const filteredUsers = users.filter(user => {
    // Don't show admin users in the list
    if (user.is_admin) return false;
    
    // Filter by type
    if (activeView === 'candidates' && !user.is_candidate) return false;
    if (activeView === 'lecturers' && !user.is_lecturer) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstname.toLowerCase().includes(searchLower) ||
        user.lastname.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleBlockToggle = async (userId: string, isCurrentlyBlocked: boolean) => {
    try {
      if (isCurrentlyBlocked) {
        await unblockUser({ variables: { user_ID: userId } });
      } else {
        await blockUser({ variables: { user_ID: userId } });
      }
    } catch (error) {
      console.error('Error toggling user block status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserTypeDisplay = (user: User) => {
    const types = [];
    if (user.is_candidate) types.push('Candidate');
    if (user.is_lecturer) types.push('Lecturer');
    return types.join(', ');
  };

  const candidateCount = users.filter(u => u.is_candidate && !u.is_admin).length;
  const lecturerCount = users.filter(u => u.is_lecturer && !u.is_admin).length;
  const blockedCount = users.filter(u => u.is_blocked && !u.is_admin).length;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            User Management
          </h3>
          <div className="text-sm text-gray-500">
            {candidateCount} Candidates • {lecturerCount} Lecturers • {blockedCount} Blocked
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: `All Users (${filteredUsers.length})` },
              { id: 'candidates', label: `Candidates (${candidateCount})` },
              { id: 'lecturers', label: `Lecturers (${lecturerCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as 'all' | 'candidates' | 'lecturers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.user_ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstname} {user.lastname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getUserTypeDisplay(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_blocked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleBlockToggle(user.user_ID, user.is_blocked)}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md ${
                        user.is_blocked
                          ? 'text-green-700 bg-green-100 hover:bg-green-200'
                          : 'text-red-700 bg-red-100 hover:bg-red-200'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {user.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm 
                ? `No users found matching "${searchTerm}"` 
                : 'No users found for the selected filter'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 