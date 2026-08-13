import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { PlotService } from './plot.service';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { CreatePlotDto } from './dto/create-plot.dto';

@Controller('plots')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PlotController {
  constructor(private readonly plotService: PlotService) {}

  @Post()
  @Roles('productor', 'admin')
  async create(@Body() dto: CreatePlotDto) {
    return this.plotService.createPlot(
      dto.name,
      dto.owner_id,
      dto.geom,
      dto.tenant_id,
      dto.certification,
    );
  }

  @Get(':id')
  @Roles('productor', 'admin', 'exportador', 'banco')
  async findPlot(@Param('id', ParseIntPipe) id: number) {
    return this.plotService.findPlot(id);
  }

  @Get('owner/:ownerId')
  @Roles('productor', 'admin')
  async findByOwner(@Param('ownerId', ParseIntPipe) ownerId: number) {
    return this.plotService.findPlotsByOwner(ownerId);
  }
}
