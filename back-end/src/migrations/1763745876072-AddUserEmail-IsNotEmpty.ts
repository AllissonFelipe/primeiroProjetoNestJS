import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserEmailIsNotEmpty1763745876072 implements MigrationInterface {
    name = 'AddUserEmailIsNotEmpty1763745876072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "email" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
    }

}
