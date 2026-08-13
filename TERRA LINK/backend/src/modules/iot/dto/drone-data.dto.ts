import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DroneDataDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  plotId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tenantId?: number;

  @IsOptional()
  @IsString()
  timestamp?: string | Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ndvi?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  biomass?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  pests?: any;

  @IsOptional()
  metadata?: any;
}
