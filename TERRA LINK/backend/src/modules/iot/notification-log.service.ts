import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../../entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly logRepo: Repository<NotificationLog>,
  ) {}

  async record(log: Partial<NotificationLog>) {
    return this.logRepo.save(this.logRepo.create(log));
  }

  async findByTenant(tenantId: number) {
    return this.logRepo.find({
      where: { tenant: { id: tenantId } },
      order: { sentAt: 'DESC' },
      take: 50,
      relations: ['tenant', 'alert'],
    });
  }
}
