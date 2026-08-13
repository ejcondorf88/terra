import { Injectable } from '@nestjs/common'
import { StakeRepository } from './stake.repository'
import { MetricsEmitter, MetricEventType } from '@terra/shared'

@Injectable()
export class FinanceService {
  private repo = new StakeRepository()
  private metrics = new MetricsEmitter()

  // List staking pools (stub)
  async listPools() {
    return [
      { id: 'pool-1', name: 'Short-term pool', apr: 0.08 },
      { id: 'pool-2', name: 'Long-term pool', apr: 0.12 },
    ]
  }

  // Stake tokens (persists to a simple JSON file and emits metric)
  async stake(userId: string, poolId: string, amount: number) {
    const startTime = Date.now()
    const stake = await this.repo.create({ userId, poolId, amount, createdAt: new Date().toISOString(), status: 'active' })
    const duration = Date.now() - startTime

    // Emit metrics
    this.metrics.emit({
      eventType: MetricEventType.STAKE_CREATED,
      value: amount,
      labels: { userId, poolId, status: 'success' },
    })
    this.metrics.emit({
      eventType: MetricEventType.ENDPOINT_LATENCY_MS,
      value: duration,
      labels: { endpoint: '/wallet/finance/stake', status: 'success' },
    })

    return stake
  }

  // Request loan (stub, with metrics)
  async requestLoan(userId: string, amount: number, collateralId?: string) {
    const startTime = Date.now()
    // TODO: implement loan underwriting and collateral handling
    const result = { loanId: 'loan-stub', status: 'pending' }
    const duration = Date.now() - startTime

    // Emit metrics
    this.metrics.emit({
      eventType: MetricEventType.CREDIT_REQUESTED,
      value: amount,
      labels: { userId, collateralId, status: 'pending' },
    })
    this.metrics.emit({
      eventType: MetricEventType.ENDPOINT_LATENCY_MS,
      value: duration,
      labels: { endpoint: '/wallet/finance/loan', status: 'success' },
    })

    return result
  }
}

