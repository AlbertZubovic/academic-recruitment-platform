import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseRoleMultiSkillSupportFixed1747653100000 implements MigrationInterface {
    name = 'AddCourseRoleMultiSkillSupportFixed1747653100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 0. Check if course_role table already exists and clean up if partial migration occurred
        const courseRoleExists = await queryRunner.hasTable("course_role");
        if (courseRoleExists) {
            console.log("Cleaning up partial migration state...");
            
            // First drop any foreign key constraints that might reference course_role
            await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);
            await queryRunner.query(`DROP TABLE IF EXISTS \`course_skill\`;`);
            await queryRunner.query(`DROP TABLE \`course_role\`;`);
            await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);
            
            // Restore course_skill table from backup if it exists, otherwise recreate the original structure
            const backupExists = await queryRunner.hasTable("course_skill_backup");
            if (backupExists) {
                console.log("Restoring course_skill from backup...");
                await queryRunner.query(`
                    CREATE TABLE \`course_skill\` (
                        \`skill_ID\` char(36) NOT NULL,
                        \`course_ID\` char(36) NOT NULL,
                        PRIMARY KEY (\`skill_ID\`, \`course_ID\`),
                        INDEX \`IDX_course_skill_skill_id\` (\`skill_ID\`),
                        INDEX \`IDX_course_skill_course_id\` (\`course_ID\`)
                    ) ENGINE=InnoDB;
                `);
                
                await queryRunner.query(`
                    INSERT INTO \`course_skill\` (\`skill_ID\`, \`course_ID\`)
                    SELECT csb.\`skill_ID\`, csb.\`course_ID\` 
                    FROM \`course_skill_backup\` csb
                    INNER JOIN \`skill\` s ON s.\`skill_ID\` = csb.\`skill_ID\`
                    INNER JOIN \`course\` c ON c.\`course_ID\` = csb.\`course_ID\`;
                `);
                
                await queryRunner.query(`
                    ALTER TABLE \`course_skill\` 
                    ADD CONSTRAINT \`FK_course_skill_skill\` 
                    FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) 
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                `);

                await queryRunner.query(`
                    ALTER TABLE \`course_skill\` 
                    ADD CONSTRAINT \`FK_course_skill_course\` 
                    FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) 
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                `);
                
                await queryRunner.query(`DROP TABLE \`course_skill_backup\`;`);
            } else {
                // If no backup, recreate empty course_skill table with original structure
                await queryRunner.query(`
                    CREATE TABLE \`course_skill\` (
                        \`skill_ID\` char(36) NOT NULL,
                        \`course_ID\` char(36) NOT NULL,
                        PRIMARY KEY (\`skill_ID\`, \`course_ID\`),
                        INDEX \`IDX_course_skill_skill_id\` (\`skill_ID\`),
                        INDEX \`IDX_course_skill_course_id\` (\`course_ID\`)
                    ) ENGINE=InnoDB;
                `);
                
                await queryRunner.query(`
                    ALTER TABLE \`course_skill\` 
                    ADD CONSTRAINT \`FK_course_skill_skill\` 
                    FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) 
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                `);

                await queryRunner.query(`
                    ALTER TABLE \`course_skill\` 
                    ADD CONSTRAINT \`FK_course_skill_course\` 
                    FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) 
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                `);
            }
        }



        // Check if roles_available column was dropped and restore it
        const courseColumns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'course' AND COLUMN_NAME = 'roles_available'
        `);
        
        if (courseColumns.length === 0) {
            console.log("Restoring roles_available column...");
            await queryRunner.query(`
                ALTER TABLE \`course\` 
                ADD \`roles_available\` text NOT NULL;
            `);
            
            await queryRunner.query(`
                UPDATE \`course\` 
                SET \`roles_available\` = 'Tutor,Lab-Assistant';
            `);
        }

        // 1. Create course_role table
        await queryRunner.query(`
            CREATE TABLE \`course_role\` (
                \`course_role_ID\` char(36) NOT NULL,
                \`role\` enum('Tutor','Lab-Assistant') NOT NULL,
                \`description\` text NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                \`positions_available\` int NOT NULL DEFAULT 1,
                \`course_ID\` char(36) NULL,
                PRIMARY KEY (\`course_role_ID\`),
                INDEX \`IDX_course_role_course_id\` (\`course_ID\`)
            ) ENGINE=InnoDB;
        `);

        // 2. Add foreign key constraint for course_role -> course
        await queryRunner.query(`
            ALTER TABLE \`course_role\` 
            ADD CONSTRAINT \`FK_course_role_course\` 
            FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION;
        `);

        // 3. Create backup of current course_skill table
        await queryRunner.query(`
            DROP TABLE IF EXISTS \`course_skill_backup\`;
        `);
        
        await queryRunner.query(`
            CREATE TABLE \`course_skill_backup\` AS 
            SELECT * FROM \`course_skill\`;
        `);

        // 4. Drop current course_skill table
        await queryRunner.query(`DROP TABLE \`course_skill\`;`);

        // 5. Create new course_skill table with course_role_ID
        await queryRunner.query(`
            CREATE TABLE \`course_skill\` (
                \`skill_ID\` char(36) NOT NULL,
                \`course_role_ID\` char(36) NOT NULL,
                PRIMARY KEY (\`skill_ID\`, \`course_role_ID\`),
                INDEX \`IDX_course_skill_skill_id\` (\`skill_ID\`),
                INDEX \`IDX_course_skill_course_role_id\` (\`course_role_ID\`)
            ) ENGINE=InnoDB;
        `);

        // 6. Add foreign key constraints for new course_skill table
        await queryRunner.query(`
            ALTER TABLE \`course_skill\` 
            ADD CONSTRAINT \`FK_course_skill_skill\` 
            FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION;
        `);

        await queryRunner.query(`
            ALTER TABLE \`course_skill\` 
            ADD CONSTRAINT \`FK_course_skill_course_role\` 
            FOREIGN KEY (\`course_role_ID\`) REFERENCES \`course_role\`(\`course_role_ID\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION;
        `);

        // 7. Update course table - remove roles_available column
        await queryRunner.query(`
            ALTER TABLE \`course\` 
            DROP COLUMN \`roles_available\`;
        `);

        // 8. Populate course_role table with default roles for existing courses
        // Create Tutor roles first
        await queryRunner.query(`
            INSERT INTO \`course_role\` (\`course_role_ID\`, \`course_ID\`, \`role\`, \`description\`, \`is_active\`, \`positions_available\`)
            SELECT 
                UUID() as \`course_role_ID\`,
                \`course_ID\`,
                'Tutor' as \`role\`,
                'Tutor role for course' as \`description\`,
                1 as \`is_active\`,
                1 as \`positions_available\`
            FROM \`course\`;
        `);

        // Create Lab-Assistant roles
        await queryRunner.query(`
            INSERT INTO \`course_role\` (\`course_role_ID\`, \`course_ID\`, \`role\`, \`description\`, \`is_active\`, \`positions_available\`)
            SELECT 
                UUID() as \`course_role_ID\`,
                \`course_ID\`,
                'Lab-Assistant' as \`role\`,
                'Lab Assistant role for course' as \`description\`,
                1 as \`is_active\`,
                1 as \`positions_available\`
            FROM \`course\`;
        `);

        // 9. Migrate existing course-skill relationships to course_role-skill relationships
        // This assigns existing course skills to both Tutor and Lab-Assistant roles
        await queryRunner.query(`
            INSERT INTO \`course_skill\` (\`skill_ID\`, \`course_role_ID\`)
            SELECT 
                csb.\`skill_ID\`,
                cr.\`course_role_ID\`
            FROM \`course_skill_backup\` csb
            JOIN \`course_role\` cr ON cr.\`course_ID\` = csb.\`course_ID\`;
        `);

        // 10. Drop backup table
        await queryRunner.query(`DROP TABLE \`course_skill_backup\`;`);
        
        console.log("Migration completed successfully!");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse the migration
        // 1. Create backup of new structure
        await queryRunner.query(`
            CREATE TABLE \`course_skill_new_backup\` AS 
            SELECT cs.\`skill_ID\`, cr.\`course_ID\`
            FROM \`course_skill\` cs
            JOIN \`course_role\` cr ON cr.\`course_role_ID\` = cs.\`course_role_ID\`
            GROUP BY cs.\`skill_ID\`, cr.\`course_ID\`;
        `);

        // 2. Drop current course_skill table
        await queryRunner.query(`DROP TABLE \`course_skill\`;`);

        // 3. Recreate old course_skill table structure
        await queryRunner.query(`
            CREATE TABLE \`course_skill\` (
                \`skill_ID\` char(36) NOT NULL,
                \`course_ID\` char(36) NOT NULL,
                PRIMARY KEY (\`skill_ID\`, \`course_ID\`),
                INDEX \`IDX_course_skill_skill_id\` (\`skill_ID\`),
                INDEX \`IDX_course_skill_course_id\` (\`course_ID\`)
            ) ENGINE=InnoDB;
        `);

        // 4. Add old foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`course_skill\` 
            ADD CONSTRAINT \`FK_course_skill_skill\` 
            FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION;
        `);

        await queryRunner.query(`
            ALTER TABLE \`course_skill\` 
            ADD CONSTRAINT \`FK_course_skill_course\` 
            FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION;
        `);

        // 5. Restore course_skill data
        await queryRunner.query(`
            INSERT INTO \`course_skill\` (\`skill_ID\`, \`course_ID\`)
            SELECT DISTINCT \`skill_ID\`, \`course_ID\` FROM \`course_skill_new_backup\`;
        `);

        // 6. Add back roles_available column to course table
        await queryRunner.query(`
            ALTER TABLE \`course\` 
            ADD \`roles_available\` text NOT NULL DEFAULT 'Tutor,Lab-Assistant';
        `);

        // 7. Drop course_role table
        await queryRunner.query(`DROP TABLE \`course_role\`;`);

        // 8. Clean up backup table
        await queryRunner.query(`DROP TABLE \`course_skill_new_backup\`;`);
    }
} 