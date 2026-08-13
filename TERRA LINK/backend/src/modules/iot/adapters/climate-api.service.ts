import { Injectable, Logger } from '@nestjs/common';

interface ClimateFetchResult {
  provider: string;
  data: any;
}

@Injectable()
export class ClimateApiService {
  private readonly logger = new Logger(ClimateApiService.name);

  // Simple implementation: if OPENWEATHER_API_KEY is set, call OpenWeather, otherwise return a stub.
  async fetchRecentClimateForPlot(plotId: number, lat?: number, lon?: number): Promise<ClimateFetchResult | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || !lat || !lon) {
      this.logger.debug('OpenWeather API key missing or coordinates not provided; returning null');
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`OpenWeather responded ${res.status}`);
        return null;
      }
      const data = await res.json();
      return { provider: 'openweather', data };
    } catch (err) {
      this.logger.warn('Failed to fetch climate data: ' + (err as Error).message);
      return null;
    }
  }
}
