import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSkillRelationships1747642686557 implements MigrationInterface {
    name = 'AddSkillRelationships1747642686557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`course_skill\` DROP FOREIGN KEY \`FK_08641a79cd0bcbb208bc84c0674\``);
        await queryRunner.query(`ALTER TABLE \`course_skill\` DROP FOREIGN KEY \`FK_bc7b8f12077328e2cbb5527476a\``);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` DROP FOREIGN KEY \`FK_99625f6b834cce2cc23304221b5\``);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` DROP FOREIGN KEY \`FK_ca109977c41166fb9549b2feea0\``);
        await queryRunner.query(`CREATE INDEX \`IDX_08641a79cd0bcbb208bc84c067\` ON \`course_skill\` (\`course_ID\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_bc7b8f12077328e2cbb5527476\` ON \`course_skill\` (\`skill_ID\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_99625f6b834cce2cc23304221b\` ON \`applied_skill\` (\`application_ID\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ca109977c41166fb9549b2feea\` ON \`applied_skill\` (\`skill_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` ADD CONSTRAINT \`FK_ca109977c41166fb9549b2feea0\` FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` ADD CONSTRAINT \`FK_99625f6b834cce2cc23304221b5\` FOREIGN KEY (\`application_ID\`) REFERENCES \`application\`(\`application_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_skill\` ADD CONSTRAINT \`FK_bc7b8f12077328e2cbb5527476a\` FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_skill\` ADD CONSTRAINT \`FK_08641a79cd0bcbb208bc84c0674\` FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`course_skill\` DROP FOREIGN KEY \`FK_08641a79cd0bcbb208bc84c0674\``);
        await queryRunner.query(`ALTER TABLE \`course_skill\` DROP FOREIGN KEY \`FK_bc7b8f12077328e2cbb5527476a\``);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` DROP FOREIGN KEY \`FK_99625f6b834cce2cc23304221b5\``);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` DROP FOREIGN KEY \`FK_ca109977c41166fb9549b2feea0\``);
        await queryRunner.query(`DROP INDEX \`IDX_ca109977c41166fb9549b2feea\` ON \`applied_skill\``);
        await queryRunner.query(`DROP INDEX \`IDX_99625f6b834cce2cc23304221b\` ON \`applied_skill\``);
        await queryRunner.query(`DROP INDEX \`IDX_bc7b8f12077328e2cbb5527476\` ON \`course_skill\``);
        await queryRunner.query(`DROP INDEX \`IDX_08641a79cd0bcbb208bc84c067\` ON \`course_skill\``);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` ADD CONSTRAINT \`FK_ca109977c41166fb9549b2feea0\` FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`applied_skill\` ADD CONSTRAINT \`FK_99625f6b834cce2cc23304221b5\` FOREIGN KEY (\`application_ID\`) REFERENCES \`application\`(\`application_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_skill\` ADD CONSTRAINT \`FK_bc7b8f12077328e2cbb5527476a\` FOREIGN KEY (\`skill_ID\`) REFERENCES \`skill\`(\`skill_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_skill\` ADD CONSTRAINT \`FK_08641a79cd0bcbb208bc84c0674\` FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
