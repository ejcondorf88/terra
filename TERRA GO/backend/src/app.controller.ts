import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface Lote {
  id: number;
  productor_id: number;
  certificacion: string;
  ubicacion: string;
  volumen: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('lotes')
  getLotes(): Lote[] {
    return [
      {
        id: 1,
        productor_id: 1,
        certificacion: 'Orgánico',
        ubicacion: 'Campo 1',
        volumen: 100
      }
    ];
  }
}
