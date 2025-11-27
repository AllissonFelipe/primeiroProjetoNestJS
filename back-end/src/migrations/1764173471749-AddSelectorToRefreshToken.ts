import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelectorToRefreshToken1764173471749 implements MigrationInterface {
    name = 'AddSelectorToRefreshToken1764173471749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "selector" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "UQ_1b2246a396af19e6c51f209dec0" UNIQUE ("selector")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "UQ_1b2246a396af19e6c51f209dec0"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "selector"`);
    }

}
