import { IsEnum, IsNumber, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateIoTAlertDto {
  @IsOptional()
  @IsInt()
  plotId?: number;

  @IsOptional()
  @IsInt()
  tenantId?: number;

  @IsEnum(['humidity', 'ndvi', 'ph', 'pest'])
  type!: 'humidity' | 'ndvi' | 'ph' | 'pest';

  @IsNumber()
  value!: number;

  @IsNumber()
  threshold!: number;

  @IsString()
  message!: string;
}
