export class IoTAlertResponseDto {
  id!: number;
  plotId?: number;
  tenantId?: number;
  type!: string;
  value!: number;
  threshold!: number;
  message!: string;
  createdAt!: Date;
  resolved!: boolean;
  resolvedAt?: Date;
}
