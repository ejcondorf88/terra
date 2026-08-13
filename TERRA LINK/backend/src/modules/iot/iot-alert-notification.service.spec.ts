import { createTransport } from 'nodemailer';
import { IoTAlertNotificationService } from './iot-alert-notification.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('IoTAlertNotificationService', () => {
  const originalEnv = process.env;
  const mockSettingsService = { findByTenantId: jest.fn(), upsertSettings: jest.fn() };
  const mockLogService = { record: jest.fn() };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete (global as any).fetch;
    mockSettingsService.findByTenantId.mockReset();
    mockSettingsService.upsertSettings.mockReset();
    mockLogService.record.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('does not call webhook when no webhook URL is configured', async () => {
    delete process.env.IOT_ALERT_NOTIFICATION_WEBHOOK_URL;
    delete process.env.SLACK_WEBHOOK_URL;
    mockSettingsService.findByTenantId.mockResolvedValue(null);

    const service = new IoTAlertNotificationService(mockSettingsService as any, mockLogService as any);
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchSpy;

    await service.notifyOnAlert({ severity: 'high', type: 'humidity', message: 'low humidity', plotId: 1, tenantId: 1, value: 25, threshold: 30 });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('posts to webhook when configured and severity meets threshold', async () => {
    process.env.IOT_ALERT_NOTIFICATION_WEBHOOK_URL = 'https://example.com/webhook';
    process.env.IOT_ALERT_NOTIFICATION_MIN_SEVERITY = 'medium';
    mockSettingsService.findByTenantId.mockResolvedValue(null);

    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchSpy;

    const service = new IoTAlertNotificationService(mockSettingsService as any, mockLogService as any);
    await service.notifyOnAlert({ severity: 'high', type: 'humidity', message: 'low humidity', plotId: 2, tenantId: 3, value: 25, threshold: 30 });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://example.com/webhook');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    const payload = JSON.parse(options.body);
    expect(payload.text).toContain('IoT Alert');
    expect(payload.attachments[0].title).toContain('low humidity');
  });

  it('does not notify when alert severity is below configured threshold', async () => {
    process.env.IOT_ALERT_NOTIFICATION_WEBHOOK_URL = 'https://example.com/webhook';
    process.env.IOT_ALERT_NOTIFICATION_MIN_SEVERITY = 'high';
    mockSettingsService.findByTenantId.mockResolvedValue(null);

    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchSpy;

    const service = new IoTAlertNotificationService(mockSettingsService as any, mockLogService as any);
    await service.notifyOnAlert({ severity: 'medium', type: 'ndvi', message: 'low ndvi', plotId: 5, tenantId: 6, value: 0.3, threshold: 0.4 });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('saves tenant notification settings through the settings service', async () => {
    const savedSettings = { tenantId: 7, channel: 'slack', severityThreshold: 'critical', target: 'https://example.com/hook' };
    mockSettingsService.upsertSettings.mockResolvedValue(savedSettings);

    const service = new IoTAlertNotificationService(mockSettingsService as any, mockLogService as any);
    const result = await service.saveSettings(7, { channel: 'slack', severityThreshold: 'critical', target: 'https://example.com/hook' });

    expect(mockSettingsService.upsertSettings).toHaveBeenCalledWith(7, {
      channel: 'slack',
      severityThreshold: 'critical',
      target: 'https://example.com/hook',
    });
    expect(result).toEqual(savedSettings);
  });

  it('sends an email when the configured channel is email', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'alerts@example.com';
    process.env.SMTP_PASS = 'secret';
    process.env.SMTP_FROM = 'terra-link@example.com';

    const sendMail = jest.fn().mockResolvedValue({ messageId: 'msg-1' });
    (createTransport as jest.Mock).mockReturnValue({ sendMail });
    mockSettingsService.findByTenantId.mockResolvedValue({ channel: 'email', severityThreshold: 'high', target: 'ops@example.com' });

    const service = new IoTAlertNotificationService(mockSettingsService as any, mockLogService as any);
    await service.notifyOnAlert({ severity: 'high', type: 'humidity', message: 'low humidity', plotId: 4, tenantId: 8, value: 25, threshold: 30 });

    expect(createTransport).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'terra-link@example.com',
      to: 'ops@example.com',
      subject: expect.stringContaining('IoT Alert'),
      text: expect.stringContaining('low humidity'),
    }));
    expect(mockLogService.record).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
