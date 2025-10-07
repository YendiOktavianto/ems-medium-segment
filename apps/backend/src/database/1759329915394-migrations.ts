import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1759329915394 implements MigrationInterface {
  name = 'Migrations1759329915394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reset_otp" ("otp_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "otp_code" character varying(10) NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_bda0e20b620f534aa6194e3afd0" PRIMARY KEY ("otp_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "address" ("address_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address_name" character varying NOT NULL, "detail_address_name" character varying NOT NULL, "longitude" numeric(10,6), "latitude" numeric(10,6), CONSTRAINT "UQ_4d45aebaf06f942354c90df29ce" UNIQUE ("detail_address_name"), CONSTRAINT "PK_db4aae0a059fd4ef7709cb802b0" PRIMARY KEY ("address_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "location" ("location_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "segment" character varying NOT NULL, "address_id" uuid, "device_id" uuid, CONSTRAINT "UQ_bf1188fd425a5c4f19d6fa22c2e" UNIQUE ("address_id"), CONSTRAINT "REL_bf1188fd425a5c4f19d6fa22c2" UNIQUE ("address_id"), CONSTRAINT "REL_77084a2fd668737ed5b7284e89" UNIQUE ("device_id"), CONSTRAINT "PK_b6e6c23b493859e5875de66c18d" PRIMARY KEY ("location_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cost_history" ("history_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cost_value" numeric(12,2) NOT NULL, "valid_from" date NOT NULL, "valid_to" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cost_id" uuid NOT NULL, CONSTRAINT "REL_de53df333107772f5ab82542b0" UNIQUE ("cost_id"), CONSTRAINT "PK_071408348e56d2639d04dc412eb" PRIMARY KEY ("history_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gol_tarif_enum" AS ENUM('R-1/TR', 'R-2/TR', 'R-3/TR', 'B-1/TR', 'B-2/TR', 'I-1/TR', 'I-2/TR', 'I-3/TR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cost" ("cost_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tariff_group" "public"."gol_tarif_enum" NOT NULL, "power_limit" character varying(50) NOT NULL, "usage_cost" numeric(12,2) NOT NULL, CONSTRAINT "PK_3eeb57fc21d4704dc3bdf32db81" PRIMARY KEY ("cost_id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."phase_type_enum" AS ENUM('1 PHASE', '3 PHASE')`);
    await queryRunner.query(
      `CREATE TABLE "monitoring_info" ("monitoring_info_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "time" TIME NOT NULL, "voltage" numeric(10,3) NOT NULL, "current" numeric(10,3) NOT NULL, "frequency" numeric(10,3) NOT NULL, "power" numeric(12,3) NOT NULL, "power_factor" numeric(4,2) NOT NULL, "total_energy_usage" numeric(16,4) NOT NULL, "total_energy_usage_today" numeric(16,4) NOT NULL, "total_energy_usage_mtd" numeric(16,4) NOT NULL, "total_energy_cost" numeric(16,4) NOT NULL, "total_energy_cost_today" numeric(16,4) NOT NULL, "total_energy_cost_mtd" numeric(16,4) NOT NULL, "wattage" numeric(12,3) NOT NULL, "phase" "public"."phase_type_enum" NOT NULL, "device_id" uuid, "cost_id" uuid, CONSTRAINT "REL_3851690d1b89a194f3a8035de5" UNIQUE ("device_id"), CONSTRAINT "PK_19c2de9ce107c6102c6b428dee2" PRIMARY KEY ("monitoring_info_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3851690d1b89a194f3a8035de5" ON "monitoring_info" ("device_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "general_info" ("device_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "serial_number" character varying(80) NOT NULL, "device_name" character varying(120) NOT NULL, "isActive" boolean NOT NULL, "user_id" uuid, CONSTRAINT "PK_d1d8296e22024fc5a926863b521" PRIMARY KEY ("device_id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(60) NOT NULL, "password_hash" character varying NOT NULL, "phone_number" character varying NOT NULL, "email" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "profil_img" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_772886e2f1f47b9ceb04a06e203" UNIQUE ("email", "username"), CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reset_otp" ADD CONSTRAINT "FK_e400b584514b2d311d300ca791e" FOREIGN KEY ("user_id") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_bf1188fd425a5c4f19d6fa22c2e" FOREIGN KEY ("address_id") REFERENCES "address"("address_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_77084a2fd668737ed5b7284e895" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" ADD CONSTRAINT "FK_de53df333107772f5ab82542b03" FOREIGN KEY ("cost_id") REFERENCES "cost"("cost_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_3851690d1b89a194f3a8035de5d" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_b770f082093b3a7544527540ee6" FOREIGN KEY ("cost_id") REFERENCES "cost"("cost_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "general_info" ADD CONSTRAINT "FK_f46aa0c9eb27311352eb569f7ce" FOREIGN KEY ("user_id") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "general_info" DROP CONSTRAINT "FK_f46aa0c9eb27311352eb569f7ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_b770f082093b3a7544527540ee6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_3851690d1b89a194f3a8035de5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" DROP CONSTRAINT "FK_de53df333107772f5ab82542b03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_77084a2fd668737ed5b7284e895"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_bf1188fd425a5c4f19d6fa22c2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reset_otp" DROP CONSTRAINT "FK_e400b584514b2d311d300ca791e"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "general_info"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3851690d1b89a194f3a8035de5"`);
    await queryRunner.query(`DROP TABLE "monitoring_info"`);
    await queryRunner.query(`DROP TYPE "public"."phase_type_enum"`);
    await queryRunner.query(`DROP TABLE "cost"`);
    await queryRunner.query(`DROP TYPE "public"."gol_tarif_enum"`);
    await queryRunner.query(`DROP TABLE "cost_history"`);
    await queryRunner.query(`DROP TABLE "location"`);
    await queryRunner.query(`DROP TABLE "address"`);
    await queryRunner.query(`DROP TABLE "reset_otp"`);
  }
}
