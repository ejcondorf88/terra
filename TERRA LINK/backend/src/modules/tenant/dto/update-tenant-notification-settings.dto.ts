import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTenantNotificationSettingsDto {
  @IsOptional()
  @IsEnum(['slack', 'teams', 'email'])
  channel?: 'slack' | 'teams' | 'email';

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  severityThreshold?: 'low' | 'medium' | 'high' | 'critical';

  @IsOptional()
  @IsString()
  @MaxLength(512)
  target?: string;
}
