import { IsDateString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SatelliteDateRangeDto {
  @IsNotEmpty()
  @IsDateString()
  from!: string;

  @IsNotEmpty()
  @IsDateString()
  to!: string;
}

export class SatelliteValidationDto {
  @IsNotEmpty()
  plotId!: string;

  @IsNotEmpty()
  coordinates!: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => SatelliteDateRangeDto)
  dateRange?: SatelliteDateRangeDto;
}
