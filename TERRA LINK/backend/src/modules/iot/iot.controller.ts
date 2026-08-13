import { Controller, Post, Body, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { IoTService } from './iot.service';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { CreateIotReadingDto } from './dto/create-iot-reading.dto';
import { DroneDataDto } from './dto/drone-data.dto';

@Controller('iot')
@UseGuards(JwtAuthGuard, RbacGuard)
export class IoTController {
  constructor(private readonly iotService: IoTService) {}

  @Post('readings')
  @Roles('admin', 'productor')
  async createReading(@Body() dto: CreateIotReadingDto) {
    return this.iotService.createReading(dto);
  }

  @Post('drones')
  @Roles('admin', 'productor')
  async createDroneData(@Body() dto: DroneDataDto) {
    return this.iotService.createDroneData(dto);
  }

  @Get('plots/:id')
  @Roles('admin', 'productor', 'exportador', 'banco')
  async getPlotReadings(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.getReadingsForPlot(id);
  }
}
