import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnToResetOTP1760521629323 implements MigrationInterface {
    name = 'AddColumnToResetOTP1760521629323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "used"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "otp_code"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "purpose" character varying(32) NOT NULL DEFAULT 'password_reset'`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "code_hash" character varying(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "used_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "attempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "resend_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "ip" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "user_agent" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ALTER COLUMN "expires_at" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_reset_otp_code_hash" ON "reset_otp" ("code_hash") `);
        await queryRunner.query(`CREATE INDEX "idx_reset_otp_exp" ON "reset_otp" ("expires_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_reset_otp_exp"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reset_otp_code_hash"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ALTER COLUMN "expires_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "user_agent"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "ip"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "resend_count"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "attempts"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "used_at"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "code_hash"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" DROP COLUMN "purpose"`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "otp_code" character varying(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reset_otp" ADD "used" boolean NOT NULL DEFAULT false`);
    }

}
