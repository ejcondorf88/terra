import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { TenantNotificationSettingsService } from '../tenant/tenant-notification-settings.service';
import { NotificationLogService } from './notification-log.service';

export type IoTAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

@Injectable()
export class IoTAlertNotificationService {
  private readonly logger = new Logger(IoTAlertNotificationService.name);
  private readonly globalWebhookUrl: string | undefined;
  private readonly globalMinSeverity: IoTAlertSeverity;
  private readonly transporter: ReturnType<typeof createTransport> | undefined;

  constructor(
    private readonly settingsService: TenantNotificationSettingsService,
    private readonly logService: NotificationLogService,
  ) {
    this.globalWebhookUrl = process.env.IOT_ALERT_NOTIFICATION_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
    const configured = (process.env.IOT_ALERT_NOTIFICATION_MIN_SEVERITY || 'high').toLowerCase();
    this.globalMinSeverity = this.isValidSeverity(configured) ? configured : 'high';
    this.transporter = this.createTransporter();
  }

  async getSettings(tenantId: number) {
    const settings = await this.settingsService.findByTenantId(tenantId);
    return {
      tenantId,
      channel: settings?.channel ?? 'slack',
      severityThreshold: settings?.severityThreshold ?? 'high',
      target: settings?.target ?? '',
    };
  }

  async saveSettings(tenantId: number, settings: { channel?: string; severityThreshold?: string; target?: string }) {
    return this.settingsService.upsertSettings(tenantId, {
      channel: settings.channel as any,
      severityThreshold: settings.severityThreshold as any,
      target: settings.target,
    });
  }

  async notifyOnAlert(alert: any) {
    const tenantId = alert.tenantId ?? null;
    const settings = tenantId ? await this.settingsService.findByTenantId(tenantId) : null;
    const channel = settings?.channel ?? 'slack';
    const threshold = settings?.severityThreshold ?? this.globalMinSeverity;
    const target = settings?.target?.trim() || this.globalWebhookUrl;

    if (!target) {
      this.logger.debug(`No notification target configured for tenant ${tenantId ?? 'unknown'}`);
      await this.recordLog({ tenantId, alert, channel, severity: alert.severity, target: '', success: false, errorMessage: 'No target configured' });
      return;
    }

    if (!this.shouldNotify(alert.severity, threshold)) {
      this.logger.debug(`Alert severity ${alert.severity} is below notification threshold ${threshold}`);
      await this.recordLog({ tenantId, alert, channel, severity: alert.severity, target, success: false, errorMessage: 'Severity below threshold' });
      return;
    }

    if (channel === 'email') {
      try {
        await this.sendEmail(alert, target);
        await this.recordLog({ tenantId, alert, channel, severity: alert.severity, target, success: true });
      } catch (error) {
        await this.recordLog({ tenantId, alert, channel, severity: alert.severity, target, success: false, errorMessage: (error as Error).message });
        throw error;
      }
      return;
    }

    const payload = this.buildPayload(alert, channel);
    try {
      await this.postWebhook(target, payload);
      await this.recordLog({ tenantId, alert, channel, severity: alert.severity, target, success: true });
    } catch (error) {
      await this.recordLog({ tenantId, alert, channel, severity: alert.severity, target, success: false, errorMessage: (error as Error).message });
      throw error;
    }
  }

  private shouldNotify(severity: string | undefined, minSeverity: IoTAlertSeverity): boolean {
    const ordering: Record<IoTAlertSeverity, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    const alertSeverity = this.isValidSeverity(severity) ? severity : 'low';
    return ordering[alertSeverity] >= ordering[minSeverity];
  }

  private buildPayload(alert: any, channel: string) {
    const color = this.getColor(alert.severity);
    const text = `IoT Alert [${alert.type}] detected for tenant ${alert.tenantId ?? 'unknown'}`;
    if (channel === 'teams') {
      return {
        title: `IoT Alert: ${alert.type.toUpperCase()}`,
        text: `${text}\n${alert.message}\nSeverity: ${alert.severity ?? 'low'}`,
      };
    }

    return {
      text,
      attachments: [
        {
          color,
          title: `${alert.type.toUpperCase()} alert: ${alert.message}`,
          fields: [
            { title: 'Severity', value: alert.severity ?? 'low', short: true },
            { title: 'Plot', value: alert.plotId ? alert.plotId.toString() : 'N/A', short: true },
            { title: 'Value', value: alert.value !== undefined ? alert.value.toString() : 'unknown', short: true },
            { title: 'Threshold', value: alert.threshold !== undefined ? alert.threshold.toString() : 'unknown', short: true },
          ],
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };
  }

  private getColor(severity: string | undefined) {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'good';
      default:
        return '#dddddd';
    }
  }

  private isValidSeverity(value: unknown): value is IoTAlertSeverity {
    return value === 'low' || value === 'medium' || value === 'high' || value === 'critical';
  }

  private async recordLog(log: Partial<any>) {
    if (!log.tenantId) {
      return;
    }

    await this.logService.record({
      tenant: { id: log.tenantId } as any,
      alert: log.alert ?? null,
      channel: (log.channel ?? 'slack') as any,
      severity: (log.severity ?? 'low') as any,
      target: log.target ?? '',
      success: Boolean(log.success),
      errorMessage: log.errorMessage,
    });
  }

  private createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return undefined;
    }

    return createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  private async sendEmail(alert: any, recipient: string) {
    if (!this.transporter) {
      throw new Error('SMTP transport is not configured');
    }

    const subject = `IoT Alert [${alert.type ?? 'unknown'}] - ${alert.severity ?? 'low'}`;
    const text = [
      `IoT Alert detected for tenant ${alert.tenantId ?? 'unknown'}`,
      `Type: ${alert.type ?? 'unknown'}`,
      `Message: ${alert.message ?? 'No message provided'}`,
      `Severity: ${alert.severity ?? 'low'}`,
      `Plot: ${alert.plotId ?? 'N/A'}`,
      `Value: ${alert.value ?? 'unknown'}`,
      `Threshold: ${alert.threshold ?? 'unknown'}`,
    ].join('\n');

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'terra-link@localhost',
      to: recipient,
      subject,
      text,
    });
  }

  private async postWebhook(target: string, payload: any) {
    try {
      const res = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Webhook request failed: ${res.status} ${res.statusText} ${body}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to post IoT alert webhook: ${(error as Error).message}`);
      throw error;
    }
  }
}
