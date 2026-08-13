import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddTenantColumns1684420000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('tenants'))) {
      await queryRunner.createTable(
        new Table({
          name: 'tenants',
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'name',
              type: 'varchar',
              length: '150',
              isNullable: false,
            },
            {
              name: 'domain',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }

    await queryRunner.query(`ALTER TABLE plots ADD COLUMN IF NOT EXISTS tenant_id integer`);
    await queryRunner.query(`ALTER TABLE nft_metadata ADD COLUMN IF NOT EXISTS tenant_id integer`);
    await queryRunner.query(`ALTER TABLE credit_proposals ADD COLUMN IF NOT EXISTS tenant_id integer`);
    await queryRunner.query(`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS tenant_id integer`);
    await queryRunner.query(`ALTER TABLE production_history ADD COLUMN IF NOT EXISTS tenant_id integer`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id integer`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_plots_tenant_id ON plots (tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_nft_metadata_tenant_id ON nft_metadata (tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_credit_proposals_tenant_id ON credit_proposals (tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_certifications_tenant_id ON certifications (tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_production_history_tenant_id ON production_history (tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE plots DROP COLUMN IF EXISTS tenant_id`);
    await queryRunner.query(`ALTER TABLE nft_metadata DROP COLUMN IF EXISTS tenant_id`);
    await queryRunner.query(`ALTER TABLE credit_proposals DROP COLUMN IF EXISTS tenant_id`);
    await queryRunner.query(`ALTER TABLE certifications DROP COLUMN IF EXISTS tenant_id`);
    await queryRunner.query(`ALTER TABLE production_history DROP COLUMN IF EXISTS tenant_id`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS tenant_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_plots_tenant_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_nft_metadata_tenant_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_credit_proposals_tenant_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_certifications_tenant_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_production_history_tenant_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_tenant_id`);
    if (await queryRunner.hasTable('tenants')) {
      await queryRunner.dropTable('tenants');
    }
  }
}
