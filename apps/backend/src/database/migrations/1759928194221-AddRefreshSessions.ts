import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshSessions1759928194221 implements MigrationInterface {
  name = 'AddRefreshSessions1759928194221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jti" uuid NOT NULL, "userId" character varying NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "replaced_by_jti" uuid, "user_agent" text, "ip" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userUserId" uuid, CONSTRAINT "PK_9190032f6967b7971dca07d69f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a0be6704c51717622df4cd7945" ON "refresh_sessions" ("jti") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_78744bff965517952df6c02da7" ON "refresh_sessions" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb0c40963cccc7058fb8f3a7a7" ON "refresh_sessions" ("expires_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_sessions" ADD CONSTRAINT "FK_293835350ce53f9529e2c465298" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_sessions" DROP CONSTRAINT "FK_293835350ce53f9529e2c465298"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_eb0c40963cccc7058fb8f3a7a7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_78744bff965517952df6c02da7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a0be6704c51717622df4cd7945"`);
    await queryRunner.query(`DROP TABLE "refresh_sessions"`);
  }
}
