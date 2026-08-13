import { Module } from '@nestjs/common';
import { TestCreditService } from '../services/test-credit.service';
import { TestCreditController } from '../controllers/test-credit.controller';

@Module({
  controllers: [TestCreditController],
  providers: [TestCreditService],
  exports: [TestCreditService],
})
export class TestCreditModule {}
