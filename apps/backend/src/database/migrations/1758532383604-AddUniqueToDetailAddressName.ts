import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueToDetailAddressName1758532383604 implements MigrationInterface {
  name = 'AddUniqueToDetailAddressName1758532383604';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "address" ADD CONSTRAINT "UQ_4d45aebaf06f942354c90df29ce" UNIQUE ("detail_address_name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "address" DROP CONSTRAINT "UQ_4d45aebaf06f942354c90df29ce"`,
    );
  }
}
