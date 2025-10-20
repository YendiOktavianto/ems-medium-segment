import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeviceRequestTable1760950390426 implements MigrationInterface {
    name = 'AddDeviceRequestTable1760950390426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "address" ADD "lattitude" double precision`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "address_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "detail_address_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "address" ADD "longitude" double precision`);
        await queryRunner.query(`ALTER TABLE "location" ALTER COLUMN "segment" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "serial_number"`);
        await queryRunner.query(`ALTER TABLE "general_info" ADD "serial_number" character varying`);
        await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "device_name"`);
        await queryRunner.query(`ALTER TABLE "general_info" ADD "device_name" character varying`);
        await queryRunner.query(`ALTER TABLE "general_info" ALTER COLUMN "isActive" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_info" ALTER COLUMN "isActive" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "device_name"`);
        await queryRunner.query(`ALTER TABLE "general_info" ADD "device_name" character varying(120) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "serial_number"`);
        await queryRunner.query(`ALTER TABLE "general_info" ADD "serial_number" character varying(80) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "location" ALTER COLUMN "segment" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "address" ADD "longitude" numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "detail_address_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "address_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "lattitude"`);
        await queryRunner.query(`ALTER TABLE "address" ADD "latitude" numeric(10,6)`);
    }

}
