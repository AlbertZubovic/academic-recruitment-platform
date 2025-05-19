import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedFromJS1747629873396 implements MigrationInterface {
    name = 'GeneratedFromJS1747629873396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`academic_credentials\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`academic_credentials\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`academic_credentials\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`academic_credentials\` varchar(255) NULL`);
    }

}
