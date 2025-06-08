import { MigrationInterface, QueryRunner } from "typeorm";

export class TransitionCourseSkillsToCourseBased1738989600000 implements MigrationInterface {
    name = 'TransitionCourseSkillsToCourseBased1738989600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create new course_skill table with course_ID instead of course_role_ID
        await queryRunner.query(`
            CREATE TABLE course_skill_new (
                skill_ID char(36) NOT NULL,
                course_ID char(36) NOT NULL,
                PRIMARY KEY (skill_ID, course_ID),
                FOREIGN KEY (skill_ID) REFERENCES skill(skill_ID) ON DELETE CASCADE,
                FOREIGN KEY (course_ID) REFERENCES course(course_ID) ON DELETE CASCADE
            )
        `);

        // Migrate existing data: get all skills from course_role and associate them with the course
        await queryRunner.query(`
            INSERT INTO course_skill_new (skill_ID, course_ID)
            SELECT DISTINCT cs.skill_ID, cr.course_ID
            FROM course_skill cs
            INNER JOIN course_role cr ON cs.course_role_ID = cr.course_role_ID
        `);

        // Drop the old course_skill table
        await queryRunner.query(`DROP TABLE course_skill`);

        // Rename the new table to course_skill
        await queryRunner.query(`ALTER TABLE course_skill_new RENAME TO course_skill`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is not easily reversible since we lose the role-skill associations
        // We would need to recreate the course_skill table with course_role_ID
        // and somehow reassign skills back to roles, which isn't deterministic
        
        // For now, we'll create the old structure but won't populate it
        await queryRunner.query(`
            CREATE TABLE course_skill_new (
                skill_ID char(36) NOT NULL,
                course_role_ID char(36) NOT NULL,
                PRIMARY KEY (skill_ID, course_role_ID),
                FOREIGN KEY (skill_ID) REFERENCES skill(skill_ID) ON DELETE CASCADE,
                FOREIGN KEY (course_role_ID) REFERENCES course_role(course_role_ID) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`DROP TABLE course_skill`);
        await queryRunner.query(`ALTER TABLE course_skill_new RENAME TO course_skill`);
        
        // Note: Data cannot be accurately restored without additional information
        console.warn('Migration reversed: course_skill table structure restored but data not repopulated');
    }
} 