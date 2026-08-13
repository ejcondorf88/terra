import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  standard!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  issuer?: string;

  @IsOptional()
  @IsDateString()
  valid_from?: string;

  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  plot_id!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  tenant_id?: number;
}
