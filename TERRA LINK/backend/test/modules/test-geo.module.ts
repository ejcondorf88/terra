import { Module } from '@nestjs/common';
import { TestGeoService } from '../services/test-geo.service';
import { TestGeoController } from '../controllers/test-geo.controller';

@Module({
  controllers: [TestGeoController],
  providers: [TestGeoService],
  exports: [TestGeoService],
})
export class TestGeoModule {}
