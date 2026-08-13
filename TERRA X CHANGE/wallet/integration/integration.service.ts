import { Injectable } from '@nestjs/common'
import { MetricsEmitter, MetricEventType } from '@terra/shared'

@Injectable()
export class IntegrationService {
  private metrics = new MetricsEmitter()

  // DAO proposal stub
  async submitProposal(proposal: any) {
    // TODO: integrate with on-chain governance
    const startTime = Date.now()
    const result = { proposalId: 'proposal-stub', status: 'submitted' }
    const duration = Date.now() - startTime

    // Emit governance/proposal metric
    this.metrics.emit({
      eventType: MetricEventType.ENDPOINT_LATENCY_MS,
      value: duration,
      labels: { endpoint: '/wallet/integration/proposal', status: 'submitted' },
    })

    return result
  }

  // IoT event handler stub
  async handleIotEvent(event: any) {
    // TODO: map sensor events to business triggers/payments
    const startTime = Date.now()
    const result = { handled: true }
    const duration = Date.now() - startTime

    // Emit IoT processing metric
    this.metrics.emit({
      eventType: MetricEventType.ENDPOINT_LATENCY_MS,
      value: duration,
      labels: { endpoint: '/wallet/integration/iot', status: 'processed' },
    })

    return result
  }
}
