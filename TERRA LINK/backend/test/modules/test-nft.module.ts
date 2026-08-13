import { Module } from '@nestjs/common';
import { TestNftService } from '../services/test-nft.service';
import { TestNftController } from '../controllers/test-nft.controller';

@Module({
  controllers: [TestNftController],
  providers: [TestNftService],
  exports: [TestNftService],
})
export class TestNftModule {}
