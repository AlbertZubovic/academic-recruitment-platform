'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_APPLICATIONS, GET_ALL_COURSES, GET_ALL_USERS } from '../graphql/queries';

interface User {
  user_ID: string;
  firstname: string;
  lastname: string;
  email: string;
  is_candidate: boolean;
}

interface Course {
  course_ID: string;
  course_code: string;
  display_name: string;
  semester: string;
}

interface Application {
  application_ID: string;
  user: User;
  course: Course;
  accepted: boolean | null;
  is_withdrawn: boolean;
  role: string;
}

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'chosen' | 'multiple' | 'unassigned'>('chosen');

  // Fetch data
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery(GET_ALL_APPLICATIONS);
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery(GET_ALL_COURSES);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);

  if (applicationsLoading || coursesLoading || usersLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (applicationsError || coursesError || usersError) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Error loading reports data:</h3>
            {applicationsError && <p>Applications: {applicationsError.message}</p>}
            {coursesError && <p>Courses: {coursesError.message}</p>}
            {usersError && <p>Users: {usersError.message}</p>}
          </div>
        </div>
      </div>
    );
  }

  const applications: Application[] = applicationsData?.applications || [];
  const courses: Course[] = coursesData?.courses || [];
  const users: User[] = usersData?.users || [];

  // Filter for non-withdrawn, accepted applications
  const acceptedApplications = applications.filter(app => 
    app.accepted === true && !app.is_withdrawn
  );

  // Report 1: Candidates chosen for each course
  const getChosenCandidatesPerCourse = () => {
    const courseGroups = new Map<string, { course: Course; candidates: User[] }>();
    
    courses.forEach(course => {
      courseGroups.set(course.course_ID, { course, candidates: [] });
    });

    acceptedApplications.forEach(app => {
      const courseGroup = courseGroups.get(app.course.course_ID);
      if (courseGroup) {
        // Check if candidate is already in the list (avoid duplicates)
        const existingCandidate = courseGroup.candidates.find(c => c.user_ID === app.user.user_ID);
        if (!existingCandidate) {
          courseGroup.candidates.push(app.user);
        }
      }
    });

    return Array.from(courseGroups.values());
  };

  // Report 2: Candidates chosen for more than 3 courses
  const getCandidatesWithMultipleCourses = () => {
    const candidateCourseCount = new Map<string, { user: User; courses: Course[] }>();

    acceptedApplications.forEach(app => {
      if (!candidateCourseCount.has(app.user.user_ID)) {
        candidateCourseCount.set(app.user.user_ID, { user: app.user, courses: [] });
      }
      
      const candidateData = candidateCourseCount.get(app.user.user_ID);
      if (candidateData) {
        // Check if course is already in the list (avoid duplicates)
        const existingCourse = candidateData.courses.find(c => c.course_ID === app.course.course_ID);
        if (!existingCourse) {
          candidateData.courses.push(app.course);
        }
      }
    });

    return Array.from(candidateCourseCount.values())
      .filter(candidate => candidate.courses.length > 3)
      .sort((a, b) => b.courses.length - a.courses.length);
  };

  // Report 3: Candidates who have not been chosen for any course
  const getUnassignedCandidates = () => {
    const candidates = users.filter(user => user.is_candidate);
    const acceptedCandidateIds = new Set(acceptedApplications.map(app => app.user.user_ID));
    
    return candidates.filter(candidate => !acceptedCandidateIds.has(candidate.user_ID));
  };

  const chosenCandidatesPerCourse = getChosenCandidatesPerCourse();
  const candidatesWithMultipleCourses = getCandidatesWithMultipleCourses();
  const unassignedCandidates = getUnassignedCandidates();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
          Candidate Reports
        </h3>

        {/* Report Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'chosen', label: `Chosen Candidates by Course` },
              { id: 'multiple', label: `Multiple Courses (${candidatesWithMultipleCourses.length})` },
              { id: 'unassigned', label: `Unassigned Candidates (${unassignedCandidates.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as 'chosen' | 'multiple' | 'unassigned')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeReport === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {activeReport === 'chosen' && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Candidates Chosen for Each Course
              </h4>
              <div className="space-y-4">
                {chosenCandidatesPerCourse.map(({ course, candidates }) => (
                  <div key={course.course_ID} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          {course.course_code} - {course.display_name}
                        </h5>
                        <p className="text-xs text-gray-500">{course.semester}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {candidates.length} chosen
                      </span>
                    </div>
                    {candidates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {candidates.map(candidate => (
                          <div key={candidate.user_ID} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="font-medium text-gray-900">
                              {candidate.firstname} {candidate.lastname}
                            </div>
                            <div className="text-gray-500 text-xs">{candidate.email}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No candidates chosen for this course</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === 'multiple' && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Candidates Chosen for More Than 3 Courses
              </h4>
              {candidatesWithMultipleCourses.length > 0 ? (
                <div className="space-y-4">
                  {candidatesWithMultipleCourses.map(({ user, courses }) => (
                    <div key={user.user_ID} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {user.firstname} {user.lastname}
                          </h5>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {courses.length} courses
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {courses.map(course => (
                          <div key={course.course_ID} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="font-medium text-gray-900">
                              {course.course_code} - {course.display_name}
                            </div>
                            <div className="text-gray-500 text-xs">{course.semester}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No candidates have been chosen for more than 3 courses.</p>
              )}
            </div>
          )}

          {activeReport === 'unassigned' && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Candidates Not Chosen for Any Course
              </h4>
              {unassignedCandidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unassignedCandidates.map(candidate => (
                    <div key={candidate.user_ID} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-medium text-gray-900">
                        {candidate.firstname} {candidate.lastname}
                      </div>
                      <div className="text-gray-500 text-sm">{candidate.email}</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                        Unassigned
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">All candidates have been chosen for at least one course.</p>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Summary Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Total Courses</div>
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-900">Candidates with Assignments</div>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.is_candidate).length - unassignedCandidates.length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-900">Unassigned Candidates</div>
              <div className="text-2xl font-bold text-red-600">{unassignedCandidates.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 