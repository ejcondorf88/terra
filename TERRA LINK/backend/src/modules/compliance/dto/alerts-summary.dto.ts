export class AlertsSummaryDto {
  totalUnresolved!: number; // total de alertas no resueltas
  bySeverity!: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byType!: {
    humidity: number;
    ndvi: number;
    ph: number;
    pest: number;
    [key: string]: number;
  };
  recurringTypes!: string[]; // tipos con 2+ alertas en últimos 30 días
  recentCount30d!: number; // alertas generadas en últimos 30 días
  summaryText!: string; // texto legible para dashboards/ESG
}
