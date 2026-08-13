import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class GenerateEsgReportDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category!: string;

  @IsOptional()
  @IsDateString()
  report_date?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  report_uri?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  plot_id!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  tenant_id?: number;
}
