import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserBookmarkColumnSizes1749216774557 implements MigrationInterface {
    name = 'UpdateUserBookmarkColumnSizes1749216774557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP FOREIGN KEY \`FK_441dab5ba6f7dca723de7ad7cca\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP FOREIGN KEY \`FK_f55c5a82fc8d95c1d06c03227a9\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`course_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP COLUMN \`user_ID\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD \`user_ID\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`course_ID\`, \`user_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`user_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP COLUMN \`course_ID\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD \`course_ID\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`user_ID\`, \`course_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD CONSTRAINT \`FK_441dab5ba6f7dca723de7ad7cca\` FOREIGN KEY (\`user_ID\`) REFERENCES \`user\`(\`user_ID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD CONSTRAINT \`FK_f55c5a82fc8d95c1d06c03227a9\` FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP FOREIGN KEY \`FK_f55c5a82fc8d95c1d06c03227a9\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP FOREIGN KEY \`FK_441dab5ba6f7dca723de7ad7cca\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`user_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP COLUMN \`course_ID\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD \`course_ID\` char(1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`course_ID\`, \`user_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`course_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP COLUMN \`user_ID\``);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD \`user_ID\` char(1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD PRIMARY KEY (\`course_ID\`, \`user_ID\`)`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD CONSTRAINT \`FK_f55c5a82fc8d95c1d06c03227a9\` FOREIGN KEY (\`course_ID\`) REFERENCES \`course\`(\`course_ID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_bookmark\` ADD CONSTRAINT \`FK_441dab5ba6f7dca723de7ad7cca\` FOREIGN KEY (\`user_ID\`) REFERENCES \`user\`(\`user_ID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
