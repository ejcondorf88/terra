import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlotService } from './plot.service';
import { PlotController } from './plot.controller';
import { Plot } from '../../entities/plot.entity';
import { GeoModule } from '../geo/geo.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plot]), GeoModule, AuthModule],
  providers: [PlotService],
  controllers: [PlotController],
  exports: [PlotService],
})
export class PlotModule {}
