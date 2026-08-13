import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNftMetadataAndComplianceTables1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to nft_metadata if they don't exist
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata ADD COLUMN IF NOT EXISTS token_uri text;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata ADD COLUMN IF NOT EXISTS metadata_uri text;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata ADD COLUMN IF NOT EXISTS minted_at timestamp;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata ADD COLUMN IF NOT EXISTS transaction_hash varchar(255);`);

    await queryRunner.query(`ALTER TABLE IF EXISTS eudr_registry ADD COLUMN IF NOT EXISTS eori_number varchar(50);`);
    await queryRunner.query(`ALTER TABLE IF EXISTS eudr_registry ADD COLUMN IF NOT EXISTS operator_name varchar(150);`);
    await queryRunner.query(`ALTER TABLE IF EXISTS eudr_registry ADD COLUMN IF NOT EXISTS is_valid boolean;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS eudr_registry ADD COLUMN IF NOT EXISTS risk_level varchar(20);`);
    await queryRunner.query(`ALTER TABLE IF EXISTS eudr_registry ADD COLUMN IF NOT EXISTS trace_registered_date timestamp;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS eudr_registry ADD COLUMN IF NOT EXISTS trace_last_updated timestamp;`);

    // Create certifications table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        name varchar(100) NOT NULL,
        standard varchar(50) NOT NULL,
        issuer varchar(100),
        valid_from date,
        valid_until date,
        plot_id integer NOT NULL,
        tenant_id integer,
        CONSTRAINT fk_cert_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
      );
    `);

    // Create eudr_registry table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS eudr_registry (
        id SERIAL PRIMARY KEY,
        tenant_id integer,
        plot_id integer NOT NULL,
        registry_number varchar(100),
        compliance_status varchar(50),
        source varchar(100),
        trace_id varchar(100),
        eori_number varchar(50),
        operator_name varchar(150),
        is_valid boolean,
        risk_level varchar(20),
        trace_registered_date timestamp,
        trace_last_updated timestamp,
        trace_url text,
        issues text,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        CONSTRAINT fk_eudr_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
      );
    `);

    // Create esg_reports table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS esg_reports (
        id SERIAL PRIMARY KEY,
        tenant_id integer,
        plot_id integer NOT NULL,
        report_date date,
        score integer,
        category varchar(50),
        details text,
        report_uri text,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        CONSTRAINT fk_esg_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
      );
    `);

    // Create satellite_validations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS satellite_validations (
        id SERIAL PRIMARY KEY,
        plot_id integer NOT NULL,
        ndvi decimal(5,2),
        forest_cover_percentage decimal(5,2),
        recent_deforestation_detected boolean,
        deforestation_review_date date,
        source varchar(32) NOT NULL,
        details text,
        range_start date,
        range_end date,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        CONSTRAINT fk_satellite_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata DROP COLUMN IF EXISTS token_uri;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata DROP COLUMN IF EXISTS metadata_uri;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata DROP COLUMN IF EXISTS minted_at;`);
    await queryRunner.query(`ALTER TABLE IF EXISTS nft_metadata DROP COLUMN IF EXISTS transaction_hash;`);

    await queryRunner.query(`DROP TABLE IF EXISTS esg_reports;`);
    await queryRunner.query(`DROP TABLE IF EXISTS eudr_registry;`);
    await queryRunner.query(`DROP TABLE IF EXISTS certifications;`);
  }
}
