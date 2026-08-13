/**
 * Shared metrics schema for business KPIs across the TERRA ecosystem.
 * Backends emit events; Prometheus scraper collects; Grafana visualizes.
 */

export enum MetricEventType {
  // Auth & User
  USER_LOGIN = 'user.login',
  USER_ONBOARDED = 'user.onboarded',

  // Finance & Credits
  CREDIT_REQUESTED = 'credit.requested',
  CREDIT_APPROVED = 'credit.approved',
  CREDIT_REJECTED = 'credit.rejected',
  CREDIT_APPROVAL_TIME_MS = 'credit.approval_time_ms',

  // Staking
  STAKE_CREATED = 'stake.created',
  STAKE_LIQUIDATED = 'stake.liquidated',
  STAKE_APR_ACHIEVED = 'stake.apr_achieved',

  // Performance
  ENDPOINT_LATENCY_MS = 'endpoint.latency_ms',
  TRANSACTION_PROCESSED = 'transaction.processed',

  // Security
  TRANSACTION_AUDITED = 'transaction.audited',
  ACCESS_ATTEMPT_BLOCKED = 'access.attempt_blocked',
}

export interface MetricEvent {
  timestamp: Date
  eventType: MetricEventType
  value: number
  labels?: {
    userId?: string
    poolId?: string
    endpoint?: string
    status?: 'success' | 'failure'
    [key: string]: string | number | undefined
  }
}

export interface MetricSummary {
  eventType: MetricEventType
  count: number
  sum: number
  avg: number
  p50: number
  p99: number
}

/**
 * Example emitter (to be used in services).
 * In a real scenario, this would push to Prometheus or an observability backend.
 */
export class MetricsEmitter {
  private events: MetricEvent[] = []

  emit(event: Omit<MetricEvent, 'timestamp'>) {
    this.events.push({
      timestamp: new Date(),
      ...event,
    })
    // TODO: push to Prometheus / observability system
    console.debug('Metric emitted:', event)
  }

  getEvents(): MetricEvent[] {
    return this.events
  }
}
