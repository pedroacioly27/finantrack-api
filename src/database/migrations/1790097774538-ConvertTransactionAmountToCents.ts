import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTransactionAmountToCents1790097774538 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "amount" TYPE integer
      USING ROUND("amount" * 100)::integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "amount" TYPE numeric(10,2)
      USING ("amount" / 100.0)::numeric(10,2)
    `);
  }
}
