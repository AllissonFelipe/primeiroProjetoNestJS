import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserPasswordLengthAndCorrectingCpf1763746420376 implements MigrationInterface {
    name = 'UpdateUserPasswordLengthAndCorrectingCpf1763746420376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "cpf"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "cpf" character varying(11) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying(11) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "cpf"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "cpf" character varying NOT NULL`);
    }

}
