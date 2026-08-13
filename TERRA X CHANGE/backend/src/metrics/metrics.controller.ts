import { Controller, Get } from '@nestjs/common'
import { prometheusExporter } from '@terra/shared'

@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics(): string {
    return prometheusExporter.getMetricsText()
  }

  @Get('summary')
  getSummary() {
    return prometheusExporter.getSummary()
  }
}
