import { Injectable } from '@nestjs/common'
import { MetricsEmitter, MetricEventType } from '@terra/shared'

@Injectable()
export class UiService {
  private metrics = new MetricsEmitter()

  // Dashboard data stub
  async getDashboard(userId: string) {
    const startTime = Date.now()
    const dashboard = {
      userId,
      balances: [],
      kpis: { activePlots: 12, yieldEstimate: 3.4 },
    }
    const duration = Date.now() - startTime

    // Emit dashboard load metric
    this.metrics.emit({
      eventType: MetricEventType.ENDPOINT_LATENCY_MS,
      value: duration,
      labels: { endpoint: '/wallet/ui/dashboard', userId, status: 'success' },
    })

    return dashboard
  }

  // Onboarding helpers (stub)
  async startOnboarding(userId: string) {
    const startTime = Date.now()
    const onboarding = { onboardingId: 'onb-stub', status: 'started' }
    const duration = Date.now() - startTime

    // Emit onboarding metric
    this.metrics.emit({
      eventType: MetricEventType.USER_ONBOARDED,
      value: 1,
      labels: { userId, status: 'initiated' },
    })
    this.metrics.emit({
      eventType: MetricEventType.ENDPOINT_LATENCY_MS,
      value: duration,
      labels: { endpoint: '/wallet/ui/onboarding', status: 'success' },
    })

    return onboarding
  }
}
