'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ALL_COURSES,
  GET_LECTURERS,
  ASSIGN_LECTURER_TO_COURSE,
  UNASSIGN_LECTURER_FROM_COURSE,
  CREATE_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE,
  GET_ALL_APPLICATIONS,
  SEARCH_SKILLS,
  CREATE_SKILL,
  CREATE_COURSE_ROLE,
  ADD_SKILL_TO_COURSE,
  REMOVE_SKILL_FROM_COURSE
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
}

interface Course {
  course_ID: string;
  course_code: string;
  display_name: string;
  semester: string;
  lecturer: User | null;
  courseRoles: CourseRole[];
  skills: Skill[];
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
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState<string | null>(null);
  
  // Enhanced course creation state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [courseSkills, setCourseSkills] = useState<Skill[]>([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState<string>('');
  const [showSkillDropdown, setShowSkillDropdown] = useState<boolean>(false);
  
  // Edit form state
  const [editSelectedRoles, setEditSelectedRoles] = useState<string[]>([]);
  const [editCourseSkills, setEditCourseSkills] = useState<Skill[]>([]);
  const [editSkillSearchTerm, setEditSkillSearchTerm] = useState<string>('');
  const [editShowSkillDropdown, setEditShowSkillDropdown] = useState<boolean>(false);

  // Queries
  const { data: coursesData, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery(GET_ALL_COURSES);
  const { data: lecturersData, loading: lecturersLoading, error: lecturersError } = useQuery(GET_LECTURERS);
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery(GET_ALL_APPLICATIONS);

  // Skill search query for course
  const skillSearch = useQuery(SEARCH_SKILLS, {
    variables: { search: skillSearchTerm },
    skip: skillSearchTerm.length < 2
  });

  // Skill search query for editing
  const editSkillSearch = useQuery(SEARCH_SKILLS, {
    variables: { search: editSkillSearchTerm },
    skip: editSkillSearchTerm.length < 2
  });

  // Mutations
  const [assignLecturerToCourse] = useMutation(ASSIGN_LECTURER_TO_COURSE);
  const [unassignLecturerFromCourse] = useMutation(UNASSIGN_LECTURER_FROM_COURSE);
  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [deleteCourse] = useMutation(DELETE_COURSE);
  const [createSkill] = useMutation(CREATE_SKILL);
  const [createCourseRole] = useMutation(CREATE_COURSE_ROLE);
  const [addSkillToCourse] = useMutation(ADD_SKILL_TO_COURSE);
  const [removeSkillFromCourse] = useMutation(REMOVE_SKILL_FROM_COURSE);

  const courses: Course[] = coursesData?.courses || [];
  const lecturers: User[] = lecturersData?.lecturers || [];
  const applications: Application[] = applicationsData?.applications || [];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCreateForm || showEditForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateForm, showEditForm]);

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
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  // Handle skill selection for course
  const handleSkillSelect = (skill: Skill) => {
    if (!courseSkills.find(s => s.skill_ID === skill.skill_ID)) {
      setCourseSkills([...courseSkills, skill]);
    }
    setSkillSearchTerm('');
    setShowSkillDropdown(false);
  };

  // Handle skill removal from course
  const handleSkillRemove = (skillId: string) => {
    setCourseSkills(courseSkills.filter(s => s.skill_ID !== skillId));
  };

  // Handle creating new skill
  const handleCreateNewSkill = async (skillName: string) => {
    if (!skillName.trim()) return;
    
    try {
      const { data } = await createSkill({
        variables: { name: skillName.trim() }
      });
      
      if (data.createSkill) {
        handleSkillSelect(data.createSkill);
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Failed to create skill');
    }
  };

  // Reset form state
  const resetFormState = () => {
    setSelectedRoles([]);
    setCourseSkills([]);
    setSkillSearchTerm('');
    setShowSkillDropdown(false);
    setShowCreateForm(false);
  };

  // Reset edit form state
  const resetEditFormState = () => {
    setEditSelectedRoles([]);
    setEditCourseSkills([]);
    setEditSkillSearchTerm('');
    setEditShowSkillDropdown(false);
    setShowEditForm(null);
  };

  // Initialize edit form with course data
  const initializeEditForm = (course: Course) => {
    setEditSelectedRoles(getRolesForCourse(course));
    setEditCourseSkills(getAllSkillsForCourse(course));
    setEditSkillSearchTerm('');
    setEditShowSkillDropdown(false);
    setShowEditForm(course.course_ID);
  };

  // Handle edit role selection
  const handleEditRoleToggle = (role: string) => {
    if (editSelectedRoles.includes(role)) {
      setEditSelectedRoles(editSelectedRoles.filter(r => r !== role));
    } else {
      setEditSelectedRoles([...editSelectedRoles, role]);
    }
  };

  // Handle edit skill selection
  const handleEditSkillSelect = (skill: Skill) => {
    if (!editCourseSkills.find(s => s.skill_ID === skill.skill_ID)) {
      setEditCourseSkills([...editCourseSkills, skill]);
    }
    setEditSkillSearchTerm('');
    setEditShowSkillDropdown(false);
  };

  // Handle edit skill removal
  const handleEditSkillRemove = (skillId: string) => {
    setEditCourseSkills(editCourseSkills.filter(s => s.skill_ID !== skillId));
  };

  // Handle course creation
  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate that at least one skill is selected
    if (courseSkills.length === 0) {
      alert('Please select at least one skill for the course.');
      return;
    }
    
    // Validate that at least one role is selected
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
        
        // Create course roles
        for (const role of selectedRoles) {
          try {
            // Create the course role
            await createCourseRole({
              variables: {
                course_ID: courseId,
                role: role,
                positions_available: 1
              }
            });
          } catch (roleError) {
            console.error(`Error creating role ${role}:`, roleError);
          }
        }
        
        // Add all course skills to the course
        for (const skill of courseSkills) {
          try {
            await addSkillToCourse({
              variables: {
                course_ID: courseId,
                skill_ID: skill.skill_ID
              }
            });
          } catch (skillError) {
            console.error(`Error adding skill ${skill.skill_ID} to course:`, skillError);
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

  // Handle course update
  const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!showEditForm) return;
    
    const course = courses.find(c => c.course_ID === showEditForm);
    if (!course) return;
    
    // Validate that at least one skill is selected
    if (editCourseSkills.length === 0) {
      alert('Please select at least one skill for the course.');
      return;
    }
    
    // Validate that at least one role is selected
    if (editSelectedRoles.length === 0) {
      alert('Please select at least one role for the course.');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // Update basic course information
      const { data } = await updateCourse({
        variables: {
          course_ID: showEditForm,
          course_code: formData.get('course_code'),
          display_name: formData.get('display_name'),
          semester: formData.get('semester'),
        }
      });
      
      if (data.updateCourse.success) {
        // Handle skill changes
        const currentSkills = getAllSkillsForCourse(course);
        const skillsToAdd = editCourseSkills.filter(skill => 
          !currentSkills.find(cs => cs.skill_ID === skill.skill_ID)
        );
        const skillsToRemove = currentSkills.filter(skill => 
          !editCourseSkills.find(es => es.skill_ID === skill.skill_ID)
        );

        // Add new skills
        for (const skill of skillsToAdd) {
          try {
            await addSkillToCourse({
              variables: { course_ID: showEditForm, skill_ID: skill.skill_ID }
            });
          } catch (error) {
            console.error('Error adding skill:', error);
          }
        }

        // Remove old skills
        for (const skill of skillsToRemove) {
          try {
            await removeSkillFromCourse({
              variables: { course_ID: showEditForm, skill_ID: skill.skill_ID }
            });
          } catch (error) {
            console.error('Error removing skill:', error);
          }
        }

        // Handle role changes
        const currentRoles = getRolesForCourse(course);
        const rolesToAdd = editSelectedRoles.filter(role => !currentRoles.includes(role));
        const rolesToRemove = currentRoles.filter(role => !editSelectedRoles.includes(role));

        // Add new roles
        for (const role of rolesToAdd) {
          try {
            await createCourseRole({
              variables: { 
                course_ID: showEditForm, 
                role, 
                positions_available: 1 
              }
            });
          } catch (error) {
            console.error('Error adding role:', error);
          }
        }

        // Remove old roles (Note: This would require a delete mutation for roles)
        // For now, we'll just log them
        if (rolesToRemove.length > 0) {
          console.log('Roles to remove (manual process required):', rolesToRemove);
        }

        alert('Course updated successfully!');
        resetEditFormState();
        refetchCourses();
      } else {
        alert(`Failed to update course: ${data.updateCourse.message}`);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
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

  // Get all skills for the course (now directly on course level)
  const getAllSkillsForCourse = (course: Course): Skill[] => {
    return course.skills || [];
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
                {/* Course Skills Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Course Skills *
                    <span className="text-xs text-gray-500 block font-normal">
                      Select skills that will be required for this course
                    </span>
                  </label>
                  
                  {/* Selected Skills */}
                  {courseSkills.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {courseSkills.map((skill) => (
                        <span
                          key={skill.skill_ID}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill.skill_ID)}
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
                      value={skillSearchTerm}
                      onChange={(e) => {
                        setSkillSearchTerm(e.target.value);
                        setShowSkillDropdown(e.target.value.length >= 2);
                      }}
                      onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Search or type to create skills..."
                    />
                    
                    {/* Skill Dropdown */}
                    {showSkillDropdown && skillSearchTerm.length >= 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {(() => {
                          const { data, loading } = skillSearch;
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
                                  onClick={() => handleSkillSelect(skill)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-900"
                                >
                                  {skill.name}
                                </button>
                              ))}
                              {searchedSkills.length === 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleCreateNewSkill(skillSearchTerm)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-blue-600 font-medium"
                                >
                                  + Create &quot;{skillSearchTerm}&quot;
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Course Roles *
                    <span className="text-xs text-gray-500 block font-normal">
                      Select which roles will be available for this course
                    </span>
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

      {/* Edit Course Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Course</h2>
            
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-course-code" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code*
                  </label>
                  <input
                    type="text"
                    id="edit-course-code"
                    name="course_code"
                    defaultValue={courses.find(c => c.course_ID === showEditForm)?.course_code || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., CITS3200"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-semester" className="block text-sm font-medium text-gray-700 mb-1">
                    Semester*
                  </label>
                  <input
                    type="text"
                    id="edit-semester"
                    name="semester"
                    defaultValue={courses.find(c => c.course_ID === showEditForm)?.semester || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Semester 2, 2024"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="edit-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name*
                </label>
                <input
                  type="text"
                  id="edit-display-name"
                  name="display_name"
                  defaultValue={courses.find(c => c.course_ID === showEditForm)?.display_name || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Professional Computing"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Roles*
                </label>
                <div className="space-y-2">
                  {['Tutor', 'Lab-Assistant'].map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editSelectedRoles.includes(role)}
                        onChange={() => handleEditRoleToggle(role)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills*
                </label>
                
                {/* Selected Skills */}
                {editCourseSkills.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {editCourseSkills.map((skill) => (
                        <span
                          key={skill.skill_ID}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => handleEditSkillRemove(skill.skill_ID)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                                 {/* Skill Search */}
                 <div className="relative">
                   <input
                     type="text"
                     value={editSkillSearchTerm}
                     onChange={(e) => setEditSkillSearchTerm(e.target.value)}
                     onFocus={() => setEditShowSkillDropdown(true)}
                     onBlur={() => setTimeout(() => setEditShowSkillDropdown(false), 200)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                     placeholder="Search for skills to add..."
                   />
                  
                  {editShowSkillDropdown && editSkillSearchTerm.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {editSkillSearch.loading && (
                        <div className="p-3 text-gray-500">Searching...</div>
                      )}
                      
                      {editSkillSearch.data?.searchSkills?.length === 0 && (
                        <div className="p-3">
                                                     <div className="text-gray-500 mb-2">No skills found matching &quot;{editSkillSearchTerm}&quot;</div>
                           <button
                             type="button"
                             onClick={() => handleCreateNewSkill(editSkillSearchTerm)}
                             className="text-blue-600 hover:text-blue-800 text-sm"
                           >
                             Create &quot;{editSkillSearchTerm}&quot; as a new skill
                           </button>
                        </div>
                      )}
                      
                      {editSkillSearch.data?.searchSkills?.map((skill: Skill) => (
                        <button
                          key={skill.skill_ID}
                          type="button"
                          onClick={() => handleEditSkillSelect(skill)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-900"
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetEditFormState}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Course
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
                    <div className="mt-2 space-y-1">
                      <div>
                        <button
                          onClick={() => initializeEditForm(course)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit Course
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDeleteCourse(course.course_ID, `${course.course_code} - ${course.display_name}`)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lecturer Assignment Form */}
                {showAssignForm === course.course_ID && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-left text-gray-900">Assign Lecturer</h4>
                    <div className="flex space-x-2">
                      <select
                        id={`lecturer-${course.course_ID}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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