// scripts/dev/seedTutorApplications.js

/**
 * Dev Utility Script
 * Randomly applies tutors to each course for demo/testing purposes.
 * Skips lecturers
 * Adds tutor IDs to course.applicants[]
 * Avoids duplicates
 * Optionally refreshes the UI if window.refreshCourses is available
 *
 * Usage:
 * Run this in the browser dev console.
 */

(() => {
    const courses = JSON.parse(localStorage.getItem('Courses') || '[]');
    const users = JSON.parse(localStorage.getItem('Users') || '[]');
  
    if (!courses.length || !users.length) {
      console.warn('No course or user data found in localStorage.');
      return;
    }
  
    const updatedCourses = courses.map(course => {
      const newApplicants = [...course.applicants];
  
      users.forEach(user => {
        // Only allow users who are tutors but not lecturers
        if (user.isTutor && !user.isLecturer) {
          const shouldApply = Math.random() < 0.5;
          const userId = `{user.id}`;
  
          if (shouldApply && !newApplicants.includes(userId)) {
            newApplicants.push(userId);
            console.log(
              `Applied ${user.firstName} ${user.lastName} as ${userId} to ${course.courseCode}`
            );
          }
        }
      });
  
      return { ...course, applicants: newApplicants };
    });
  
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    console.log('Tutor applications injected successfully.');
  
    // Trigger course refresh in app
    if (typeof window.refreshCourses === 'function') {
      window.refreshCourses();
      console.log('Courses refreshed in UI.');
    }
  })();
  