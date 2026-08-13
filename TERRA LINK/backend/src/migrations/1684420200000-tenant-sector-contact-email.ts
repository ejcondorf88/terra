import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTenantSectorContactEmail1684420200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'sector',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'contactEmail',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tenants', 'contactEmail');
    await queryRunner.dropColumn('tenants', 'sector');
  }
}
