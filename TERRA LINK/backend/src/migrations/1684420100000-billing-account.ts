import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class BillingAccount1684420100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('billing_accounts'))) {
      await queryRunner.createTable(
        new Table({
          name: 'billing_accounts',
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'tenant_id',
              type: 'integer',
              isNullable: false,
            },
            {
              name: 'stripe_customer_id',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'stripe_subscription_id',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'varchar',
              length: '50',
              default: "'pending'",
            },
            {
              name: 'price_id',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'current_period_end',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'latest_invoice_id',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_billing_accounts_tenant_id ON billing_accounts (tenant_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_billing_accounts_tenant_id`);
    if (await queryRunner.hasTable('billing_accounts')) {
      await queryRunner.dropTable('billing_accounts');
    }
  }
}
