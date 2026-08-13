import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateIoTAlertDto {
  @IsBoolean()
  resolved!: boolean;

  @IsOptional()
  resolvedAt?: Date;
}
