import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserBookmarkTable1749216298331 implements MigrationInterface {
    name = 'CreateUserBookmarkTable1749216298331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_bookmark\` (\`user_ID\` char NOT NULL, \`course_ID\` char NOT NULL, \`bookmarked_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_ID\`, \`course_ID\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD CONSTRAINT \`FK_441dab5ba6f7dca723de7ad7cca\` FOREIGN KEY (\`user_ID\`) REFERENCES \`user\`(\`user_ID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD CONSTRAINT \`FK_f55c5a82fc8d95c1d06c03227a9\` FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP FOREIGN KEY \`FK_f55c5a82fc8d95c1d06c03227a9\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP FOREIGN KEY \`FK_441dab5ba6f7dca723de7ad7cca\``);
        await queryRunner.query(`DROP TABLE \`user_bookmark\``);
    }

}
