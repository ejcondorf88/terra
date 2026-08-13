/**
 * Prometheus Exporter for TERRA Business Metrics
 *
 * This module initializes Prometheus clients (counter, histogram, gauge)
 * to track business KPIs. In production, integrate with prom-client library.
 *
 * Usage in a NestJS application:
 * 1. Import this module in AppModule
 * 2. Register PrometheusExporter as a singleton
 * 3. Expose /metrics endpoint in a controller
 * 4. Configure Prometheus scraper to pull from /metrics
 */

export interface PrometheusMetric {
  name: string
  help: string
  type: 'counter' | 'histogram' | 'gauge'
  value: number
  labels?: Record<string, string>
}

export class PrometheusExporter {
  private metrics: Map<string, PrometheusMetric> = new Map()

  // Business KPI Counters
  private loginCounter = 0
  private onboardedCounter = 0
  private creditRequestedCounter = 0
  private creditApprovedCounter = 0
  private creditRejectedCounter = 0
  private stakeCreatedCounter = 0

  // Performance Histograms (simplified - stores last 100 samples)
  private latencyHistory: Map<string, number[]> = new Map()

  /**
   * Record a successful login
   */
  recordLogin(userId: string, durationMs: number) {
    this.loginCounter++
    this.recordHistogram('login_latency_ms', durationMs, { userId })
  }

  /**
   * Record a new user onboarding
   */
  recordOnboarding(userId: string) {
    this.onboardedCounter++
  }

  /**
   * Record a credit request
   */
  recordCreditRequest(amount: number, userId: string) {
    this.creditRequestedCounter++
    this.recordHistogram('credit_request_amount', amount, { userId })
  }

  /**
   * Record a credit approval with time taken
   */
  recordCreditApproval(amount: number, durationMs: number, userId: string) {
    this.creditApprovedCounter++
    this.recordHistogram('credit_approval_time_ms', durationMs, { userId })
    this.recordHistogram('credit_approved_amount', amount, { userId })
  }

  /**
   * Record a credit rejection
   */
  recordCreditRejection(userId: string, reason?: string) {
    this.creditRejectedCounter++
  }

  /**
   * Record a stake creation
   */
  recordStake(amount: number, poolId: string, durationMs: number) {
    this.stakeCreatedCounter++
    this.recordHistogram('stake_amount', amount, { poolId })
    this.recordHistogram('stake_latency_ms', durationMs, { poolId })
  }

  /**
   * Record endpoint latency
   */
  recordEndpointLatency(endpoint: string, durationMs: number) {
    this.recordHistogram('endpoint_latency_ms', durationMs, { endpoint })
  }

  /**
   * Internal: record histogram value
   */
  private recordHistogram(name: string, value: number, labels?: Record<string, string>) {
    const key = `${name}:${JSON.stringify(labels || {})}`
    if (!this.latencyHistory.has(name)) {
      this.latencyHistory.set(name, [])
    }
    const history = this.latencyHistory.get(name)!
    history.push(value)
    // Keep only last 100 samples
    if (history.length > 100) {
      history.shift()
    }
  }

  /**
   * Get Prometheus format output for scraping
   * Format: # HELP metric_name Description\n# TYPE metric_name gauge\nmetric_name{label="value"} 123
   */
  getMetricsText(): string {
    const lines: string[] = []

    // Counters
    lines.push('# HELP login_total Total login attempts')
    lines.push('# TYPE login_total counter')
    lines.push(`login_total ${this.loginCounter}`)

    lines.push('# HELP user_onboarded_total Total onboarded users')
    lines.push('# TYPE user_onboarded_total counter')
    lines.push(`user_onboarded_total ${this.onboardedCounter}`)

    lines.push('# HELP credit_requested_total Total credit requests')
    lines.push('# TYPE credit_requested_total counter')
    lines.push(`credit_requested_total ${this.creditRequestedCounter}`)

    lines.push('# HELP credit_approved_total Total approved credits')
    lines.push('# TYPE credit_approved_total counter')
    lines.push(`credit_approved_total ${this.creditApprovedCounter}`)

    lines.push('# HELP credit_rejected_total Total rejected credits')
    lines.push('# TYPE credit_rejected_total counter')
    lines.push(`credit_rejected_total ${this.creditRejectedCounter}`)

    lines.push('# HELP stake_created_total Total stakes created')
    lines.push('# TYPE stake_created_total counter')
    lines.push(`stake_created_total ${this.stakeCreatedCounter}`)

    // Histograms (report P50, P99)
    for (const [name, values] of this.latencyHistory.entries()) {
      if (values.length === 0) continue

      const sorted = [...values].sort((a, b) => a - b)
      const p50 = sorted[Math.floor(sorted.length * 0.5)]
      const p99 = sorted[Math.floor(sorted.length * 0.99)]
      const avg = values.reduce((a, b) => a + b, 0) / values.length

      lines.push(`# HELP ${name} Latency in milliseconds`)
      lines.push(`# TYPE ${name} histogram`)
      lines.push(`${name}_p50 ${p50}`)
      lines.push(`${name}_p99 ${p99}`)
      lines.push(`${name}_avg ${avg.toFixed(2)}`)
    }

    return lines.join('\n')
  }

  /**
   * Get metrics summary as JSON (for dashboards)
   */
  getSummary() {
    return {
      counters: {
        login_total: this.loginCounter,
        user_onboarded_total: this.onboardedCounter,
        credit_requested_total: this.creditRequestedCounter,
        credit_approved_total: this.creditApprovedCounter,
        credit_rejected_total: this.creditRejectedCounter,
        stake_created_total: this.stakeCreatedCounter,
      },
      derivedMetrics: {
        credit_approval_rate: this.creditRequestedCounter > 0 
          ? (this.creditApprovedCounter / this.creditRequestedCounter * 100).toFixed(2) + '%'
          : 'N/A',
      },
    }
  }
}

/**
 * Singleton instance (to be injected into services)
 */
export const prometheusExporter = new PrometheusExporter()
