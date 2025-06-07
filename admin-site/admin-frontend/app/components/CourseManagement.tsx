'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ALL_COURSES,
  GET_LECTURERS,
  ASSIGN_LECTURER_TO_COURSE,
  UNASSIGN_LECTURER_FROM_COURSE,
  CREATE_COURSE,
  UPDATE_APPLICATION_STATUS,
  GET_ALL_APPLICATIONS
} from '../graphql/queries';

interface User {
  user_ID: string;
  firstname: string;
  lastname: string;
  email: string;
  student_ID?: string;
}

interface Course {
  course_ID: string;
  course_code: string;
  display_name: string;
  semester: string;
  lecturer: User | null;
  roles_available: string[];
  is_disabled: boolean;
}

interface Application {
  application_ID: string;
  user: User;
  course: Course;
  applied_availability: string;
  accepted: boolean | null;
  ranking: number | null;
  role: string;
  lecturer_comment: string | null;
  is_withdrawn: boolean;
  withdrawn_at: string | null;
}

const CourseManagement: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState<string | null>(null);

  // Queries
  const { data: coursesData, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery(GET_ALL_COURSES);
  const { data: lecturersData, loading: lecturersLoading, error: lecturersError } = useQuery(GET_LECTURERS);
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery(GET_ALL_APPLICATIONS);

  // Mutations
  const [assignLecturerToCourse] = useMutation(ASSIGN_LECTURER_TO_COURSE);
  const [unassignLecturerFromCourse] = useMutation(UNASSIGN_LECTURER_FROM_COURSE);
  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateApplicationStatus] = useMutation(UPDATE_APPLICATION_STATUS);

  const courses: Course[] = coursesData?.courses || [];
  const lecturers: User[] = lecturersData?.lecturers || [];
  const applications: Application[] = applicationsData?.applications || [];

  // Debug logging
  console.log('CourseManagement Debug:', {
    coursesLoading,
    coursesError,
    coursesData,
    courseCount: courses.length
  });

  // Get applications for a specific course
  const getApplicationsForCourse = (courseId: string) => {
    return applications.filter(app => app.course.course_ID === courseId);
  };

  // Handle lecturer assignment
  const handleAssignLecturer = async (courseId: string, lecturerId: string) => {
    try {
      const { data } = await assignLecturerToCourse({
        variables: { course_ID: courseId, lecturer_ID: lecturerId }
      });
      
      if (data.assignLecturerToCourse.success) {
        alert('Lecturer assigned successfully!');
        refetchCourses();
        setShowAssignForm(null);
      } else {
        alert(data.assignLecturerToCourse.message);
      }
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      alert('Failed to assign lecturer');
    }
  };

  // Handle lecturer unassignment
  const handleUnassignLecturer = async (courseId: string) => {
    try {
      const { data } = await unassignLecturerFromCourse({
        variables: { course_ID: courseId }
      });
      
      if (data.unassignLecturerFromCourse.success) {
        alert('Lecturer unassigned successfully!');
        refetchCourses();
      } else {
        alert(data.unassignLecturerFromCourse.message);
      }
    } catch (error) {
      console.error('Error unassigning lecturer:', error);
      alert('Failed to unassign lecturer');
    }
  };

  // Handle course creation
  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data } = await createCourse({
        variables: {
          course_code: formData.get('course_code'),
          display_name: formData.get('display_name'),
          semester: formData.get('semester'),
          lecturer_ID: formData.get('lecturer_ID') || null,
          roles_available: [formData.get('roles_available') || 'Tutor']
        }
      });
      
      if (data.createCourse.success) {
        alert('Course created successfully!');
        refetchCourses();
        setShowCreateForm(false);
      } else {
        alert(data.createCourse.message);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  // Handle application status update
  const handleUpdateApplicationStatus = async (applicationId: string, accepted: boolean, comment?: string) => {
    try {
      const { data } = await updateApplicationStatus({
        variables: {
          application_ID: applicationId,
          accepted,
          lecturer_comment: comment || null
        }
      });
      
      if (data.updateApplicationStatus.success) {
        alert('Application status updated successfully!');
        // Refetch applications
        window.location.reload();
      } else {
        alert(data.updateApplicationStatus.message);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    }
  };

  if (coursesLoading || lecturersLoading || applicationsLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course management...</p>
        </div>
      </div>
    );
  }

  // Show errors if any
  if (coursesError || lecturersError || applicationsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold">Error loading data:</h3>
          {coursesError && <p>Courses: {coursesError.message}</p>}
          {lecturersError && <p>Lecturers: {lecturersError.message}</p>}
          {applicationsError && <p>Applications: {applicationsError.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Course
        </button>
      </div>

      {/* Create Course Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  name="course_code"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="display_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  name="semester"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024-S1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lecturer (Optional)
                </label>
                <select
                  name="lecturer_ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.user_ID} value={lecturer.user_ID}>
                      {lecturer.firstname} {lecturer.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Available
                </label>
                <select
                  name="roles_available"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tutor">Tutor</option>
                  <option value="Lab-Assistant">Lab Assistant</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid gap-6">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-600 mb-4">
                There are currently no courses in the system. Create a new course to get started.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Course
              </button>
            </div>
          </div>
        ) : (
          courses.map((course) => {
          const courseApplications = getApplicationsForCourse(course.course_ID);
          
          return (
            <div key={course.course_ID} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {course.course_code} - {course.display_name}
                    </h3>
                    <p className="text-gray-600">{course.semester}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {course.roles_available.join(', ')}
                      </span>
                      {course.is_disabled && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Lecturer: {course.lecturer ? `${course.lecturer.firstname} ${course.lecturer.lastname}` : 'Not Assigned'}
                    </p>
                    <div className="mt-2 space-x-2">
                      {course.lecturer ? (
                        <button
                          onClick={() => handleUnassignLecturer(course.course_ID)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Unassign Lecturer
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowAssignForm(course.course_ID)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Assign Lecturer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lecturer Assignment Form */}
                {showAssignForm === course.course_ID && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Assign Lecturer</h4>
                    <div className="flex space-x-2">
                      <select
                        id={`lecturer-${course.course_ID}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Lecturer</option>
                        {lecturers.map((lecturer) => (
                          <option key={lecturer.user_ID} value={lecturer.user_ID}>
                            {lecturer.firstname} {lecturer.lastname}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const select = document.getElementById(`lecturer-${course.course_ID}`) as HTMLSelectElement;
                          if (select.value) {
                            handleAssignLecturer(course.course_ID, select.value);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setShowAssignForm(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Applications Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      Applications ({courseApplications.length})
                    </h4>
                    <button
                      onClick={() => setSelectedCourse(selectedCourse === course.course_ID ? null : course.course_ID)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {selectedCourse === course.course_ID ? 'Hide' : 'View'} Applications
                    </button>
                  </div>

                  {selectedCourse === course.course_ID && (
                    <div className="space-y-3">
                      {courseApplications.length === 0 ? (
                        <p className="text-gray-500 text-sm">No applications for this course</p>
                      ) : (
                        courseApplications.map((application) => (
                          <div key={application.application_ID} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">
                                  {application.user.firstname} {application.user.lastname}
                                </h5>
                                <p className="text-sm text-gray-600">{application.user.email}</p>
                                <p className="text-sm text-gray-600">
                                  Role: {application.role} | Availability: {application.applied_availability}
                                </p>
                                {application.ranking && (
                                  <p className="text-sm text-gray-600">Ranking: {application.ranking}</p>
                                )}
                                {application.lecturer_comment && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Comment: {application.lecturer_comment}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    application.accepted === true ? 'bg-green-100 text-green-800' :
                                    application.accepted === false ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {application.accepted === true ? 'Accepted' :
                                     application.accepted === false ? 'Rejected' : 'Pending'}
                                  </span>
                                </div>
                                {application.accepted === null && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleUpdateApplicationStatus(application.application_ID, true)}
                                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleUpdateApplicationStatus(application.application_ID, false)}
                                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};

export default CourseManagement; 