import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class RegisterEudrDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  trace_id!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  registry_number!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  compliance_status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @IsOptional()
  @IsString()
  trace_url?: string;

  @IsOptional()
  @IsString()
  issues?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  plot_id!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  tenant_id?: number;
}
