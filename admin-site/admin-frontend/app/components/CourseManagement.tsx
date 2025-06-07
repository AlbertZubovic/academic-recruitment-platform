'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ALL_COURSES,
  GET_LECTURERS,
  ASSIGN_LECTURER_TO_COURSE,
  UNASSIGN_LECTURER_FROM_COURSE,
  CREATE_COURSE,
  DELETE_COURSE,
  GET_ALL_APPLICATIONS,
  SEARCH_SKILLS,
  CREATE_SKILL,
  CREATE_COURSE_ROLE,
  ADD_SKILL_TO_COURSE_ROLE
} from '../graphql/queries';

interface User {
  user_ID: string;
  firstname: string;
  lastname: string;
  email: string;
  student_ID?: string;
}

interface Skill {
  skill_ID: string;
  name: string;
}

interface CourseRole {
  course_role_ID: string;
  role: string;
  description?: string;
  is_active: boolean;
  positions_available: number;
  skills: Skill[];
}

interface Course {
  course_ID: string;
  course_code: string;
  display_name: string;
  semester: string;
  lecturer: User | null;
  courseRoles: CourseRole[];
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
  
  // Enhanced course creation state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleSkills, setRoleSkills] = useState<Record<string, Skill[]>>({});
  const [skillSearchTerms, setSkillSearchTerms] = useState<Record<string, string>>({});
  const [showSkillDropdowns, setShowSkillDropdowns] = useState<Record<string, boolean>>({});

  // Queries
  const { data: coursesData, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery(GET_ALL_COURSES);
  const { data: lecturersData, loading: lecturersLoading, error: lecturersError } = useQuery(GET_LECTURERS);
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery(GET_ALL_APPLICATIONS);

  // Skill search queries for each role
  const tutorSkillSearch = useQuery(SEARCH_SKILLS, {
    variables: { search: skillSearchTerms['Tutor'] || '' },
    skip: (skillSearchTerms['Tutor'] || '').length < 2
  });
  
  const labAssistantSkillSearch = useQuery(SEARCH_SKILLS, {
    variables: { search: skillSearchTerms['Lab-Assistant'] || '' },
    skip: (skillSearchTerms['Lab-Assistant'] || '').length < 2
  });

  // Mutations
  const [assignLecturerToCourse] = useMutation(ASSIGN_LECTURER_TO_COURSE);
  const [unassignLecturerFromCourse] = useMutation(UNASSIGN_LECTURER_FROM_COURSE);
  const [createCourse] = useMutation(CREATE_COURSE);
  const [deleteCourse] = useMutation(DELETE_COURSE);
  const [createSkill] = useMutation(CREATE_SKILL);
  const [createCourseRole] = useMutation(CREATE_COURSE_ROLE);
  const [addSkillToCourseRole] = useMutation(ADD_SKILL_TO_COURSE_ROLE);

  const courses: Course[] = coursesData?.courses || [];
  const lecturers: User[] = lecturersData?.lecturers || [];
  const applications: Application[] = applicationsData?.applications || [];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCreateForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateForm]);

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

  // Handle role selection
  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
      // Clean up skills for removed role
      const newRoleSkills = { ...roleSkills };
      delete newRoleSkills[role];
      setRoleSkills(newRoleSkills);
      
      const newSearchTerms = { ...skillSearchTerms };
      delete newSearchTerms[role];
      setSkillSearchTerms(newSearchTerms);
      
      const newDropdowns = { ...showSkillDropdowns };
      delete newDropdowns[role];
      setShowSkillDropdowns(newDropdowns);
    } else {
      setSelectedRoles([...selectedRoles, role]);
      setRoleSkills({ ...roleSkills, [role]: [] });
    }
  };

  // Handle skill selection for a role
  const handleSkillSelect = (role: string, skill: Skill) => {
    const currentSkills = roleSkills[role] || [];
    if (!currentSkills.find(s => s.skill_ID === skill.skill_ID)) {
      setRoleSkills({
        ...roleSkills,
        [role]: [...currentSkills, skill]
      });
    }
    setSkillSearchTerms({ ...skillSearchTerms, [role]: '' });
    setShowSkillDropdowns({ ...showSkillDropdowns, [role]: false });
  };

  // Handle skill removal for a role
  const handleSkillRemove = (role: string, skillId: string) => {
    setRoleSkills({
      ...roleSkills,
      [role]: (roleSkills[role] || []).filter(s => s.skill_ID !== skillId)
    });
  };

  // Handle creating new skill
  const handleCreateNewSkill = async (role: string, skillName: string) => {
    if (!skillName.trim()) return;
    
    try {
      const { data } = await createSkill({
        variables: { name: skillName.trim() }
      });
      
      if (data.createSkill) {
        handleSkillSelect(role, data.createSkill);
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Failed to create skill');
    }
  };

  // Reset form state
  const resetFormState = () => {
    setSelectedRoles([]);
    setRoleSkills({});
    setSkillSearchTerms({});
    setShowSkillDropdowns({});
    setShowCreateForm(false);
  };

  // Handle course creation
  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedRoles.length === 0) {
      alert('Please select at least one role for the course.');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // First create the course
      const { data } = await createCourse({
        variables: {
          course_code: formData.get('course_code'),
          display_name: formData.get('display_name'),
          semester: formData.get('semester'),
          lecturer_ID: formData.get('lecturer_ID') || null
        }
      });
      
      if (data.createCourse.success && data.createCourse.course_ID) {
        const courseId = data.createCourse.course_ID;
        
        // Create course roles and assign skills
        for (const role of selectedRoles) {
          try {
            // Create the course role
            const roleResponse = await createCourseRole({
              variables: {
                course_ID: courseId,
                role: role,
                positions_available: 1
              }
            });
            
            if (roleResponse.data.createCourseRole.course_role_ID) {
              const courseRoleId = roleResponse.data.createCourseRole.course_role_ID;
              
              // Add skills to the course role
              const skills = roleSkills[role] || [];
              for (const skill of skills) {
                await addSkillToCourseRole({
                  variables: {
                    course_role_ID: courseRoleId,
                    skill_ID: skill.skill_ID
                  }
                });
              }
            }
          } catch (roleError) {
            console.error(`Error creating role ${role}:`, roleError);
          }
        }
        
        alert('Course created successfully with roles and skills!');
        await refetchCourses();
        resetFormState();
      } else {
        alert(data.createCourse.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
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

  // Handle course deletion
  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the course "${courseName}"?\n\nThis action cannot be undone. The course can only be deleted if it has no applications.`
    );
    
    if (!confirmed) return;
    
    try {
      const { data } = await deleteCourse({
        variables: { course_ID: courseId }
      });
      
      if (data.deleteCourse.success) {
        alert('Course deleted successfully!');
        refetchCourses();
      } else {
        alert(data.deleteCourse.message);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  // Get all skills from all course roles for display
  const getAllSkillsForCourse = (course: Course): Skill[] => {
    const allSkills: Skill[] = [];
    const seenSkillIds = new Set<string>();
    
    course.courseRoles.forEach(role => {
      role.skills.forEach(skill => {
        if (!seenSkillIds.has(skill.skill_ID)) {
          allSkills.push(skill);
          seenSkillIds.add(skill.skill_ID);
        }
      });
    });
    
    return allSkills;
  };

  // Get roles available for a course
  const getRolesForCourse = (course: Course): string[] => {
    return course.courseRoles.map(role => role.role);
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col my-8">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
                         <form id="course-creation-form" onSubmit={handleCreateCourse}>
                              <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Course Code
                  </label>
                  <input
                    type="text"
                    name="course_code"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., COSC120 or COSC1011"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    name="semester"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Fall 2025"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Lecturer (Optional)
                  </label>
                  <select
                    name="lecturer_ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">No Lecturer</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.user_ID} value={lecturer.user_ID}>
                        {lecturer.firstname} {lecturer.lastname}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Role Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Course Roles
                  </label>
                  <div className="space-y-2">
                    {['Tutor', 'Lab-Assistant'].map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills for Selected Roles */}
                {selectedRoles.map((role) => (
                  <div key={role} className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Skills for {role}
                    </label>
                    
                    {/* Selected Skills */}
                    {(roleSkills[role] || []).length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {(roleSkills[role] || []).map((skill) => (
                          <span
                            key={skill.skill_ID}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {skill.name}
                            <button
                              type="button"
                              onClick={() => handleSkillRemove(role, skill.skill_ID)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Skill Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={skillSearchTerms[role] || ''}
                        onChange={(e) => {
                          setSkillSearchTerms({ ...skillSearchTerms, [role]: e.target.value });
                          setShowSkillDropdowns({ ...showSkillDropdowns, [role]: e.target.value.length >= 2 });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder={`Search skills for ${role}...`}
                      />
                      
                      {/* Skill Dropdown */}
                      {showSkillDropdowns[role] && (skillSearchTerms[role] || '').length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {(() => {
                            const searchData = role === 'Tutor' ? tutorSkillSearch : labAssistantSkillSearch;
                            const { data, loading } = searchData;
                            const searchedSkills = data?.searchSkills || [];
                            
                            if (loading) {
                              return <div className="px-3 py-2 text-gray-500">Searching...</div>;
                            }
                            
                            return (
                              <>
                                {searchedSkills.map((skill: Skill) => (
                                  <button
                                    key={skill.skill_ID}
                                    type="button"
                                    onClick={() => handleSkillSelect(role, skill)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-900"
                                  >
                                    {skill.name}
                                  </button>
                                ))}
                                {searchedSkills.length === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleCreateNewSkill(role, skillSearchTerms[role] || '')}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-blue-600 font-medium"
                                  >
                                    + Create &quot;{skillSearchTerms[role]}&quot;
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </form>
            </div>
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetFormState}
                  className="px-6 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors font-medium border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="course-creation-form"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  Create Course
                </button>
              </div>
            </div>
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
                        {getRolesForCourse(course).join(', ')}
                      </span>
                      {course.is_disabled && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Disabled
                        </span>
                      )}
                    </div>
                    
                    {/* Skills Display */}
                    {getAllSkillsForCourse(course).length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {getAllSkillsForCourse(course).map((skill) => (
                            <span
                              key={skill.skill_ID}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                    <div className="mt-2">
                      <button
                        onClick={() => handleDeleteCourse(course.course_ID, `${course.course_code} - ${course.display_name}`)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete Course
                      </button>
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
                                <h5 className="font-semibold text-gray-900 text-base">
                                  {application.user.firstname} {application.user.lastname}
                                </h5>
                                <p className="text-sm text-gray-700 font-medium">{application.user.email}</p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Role:</span> {application.role} | <span className="font-medium">Availability:</span> {application.applied_availability}
                                </p>
                                {application.ranking && (
                                  <p className="text-sm text-gray-700"><span className="font-medium">Ranking:</span> {application.ranking}</p>
                                )}
                                {application.lecturer_comment && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    <span className="font-medium">Comment:</span> {application.lecturer_comment}
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