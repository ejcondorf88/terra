import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber, IsObject, Min } from 'class-validator';

export class CreatePlotDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  owner_id!: number;

  @IsNotEmpty()
  @IsObject()
  geom!: any; // GeoJSON geometry

  @IsOptional()
  @IsNumber()
  @Min(1)
  tenant_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  certification?: string;
}
