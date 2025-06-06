import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWithdrawalToApplication1749204562920 implements MigrationInterface {
    name = 'AddWithdrawalToApplication1749204562920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`application\` ADD \`is_withdrawn\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`application\` ADD \`withdrawn_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`application\` DROP COLUMN \`withdrawn_at\``);
        await queryRunner.query(`ALTER TABLE \`application\` DROP COLUMN \`is_withdrawn\``);
    }

}
