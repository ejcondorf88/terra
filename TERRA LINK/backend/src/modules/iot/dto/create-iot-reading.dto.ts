import { IsOptional, IsNumber, IsInt, IsString } from 'class-validator';

export class CreateIotReadingDto {
  @IsOptional()
  @IsInt()
  plotId?: number;

  @IsOptional()
  @IsInt()
  tenantId?: number;

  @IsOptional()
  @IsString()
  timestamp?: string | Date;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  ph?: number;

  @IsOptional()
  pests?: any;
}
